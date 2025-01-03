import OpenAI from 'openai'
import { ChampionData, type Role } from './champion'
import { statsService } from './stats'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface TeamMember {
  champion: ChampionData
  role: Role
}

interface Build {
  items: Array<{
    id: string
    name: string
    iconUrl: string
  }>
  runes: Array<{
    id: string
    name: string
    iconUrl: string
  }>
  summoners: Array<{
    id: string
    name: string
    iconUrl: string
  }>
  skillOrder: Array<{
    id: number
    name: string
    iconUrl: string
  }>
}

async function fetchChampionInfo(championName: string): Promise<string> {
  try {
    // First, try to get info from League's official Data Dragon API
    const response = await fetch(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${championName.toLowerCase()}.json`)
    if (response.ok) {
      const data = await response.json()
      return `${championName} is a ${data.title}. ${data.shortBio}`
    }

    // If that fails, we could try to get a summary from the model itself
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a League of Legends expert. Provide a brief description of the champion, focusing on their playstyle and role in the game.',
        },
        {
          role: 'user',
          content: `What is ${championName}'s playstyle and role in League of Legends? Keep it brief.`,
        },
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      max_tokens: 100,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error(`Error fetching info for ${championName}:`, error)
    return ''
  }
}

export async function getChampionRecommendations(
  allies: TeamMember[],
  enemies: ChampionData[],
  targetRole: Role,
  availableChampions: ChampionData[]
): Promise<{ recommendations: ChampionData[]; explanations: string[]; builds: Build[] }> {
  try {
    const prompt = generatePrompt(allies, enemies, targetRole)
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const { recommendations, explanations } = parseRecommendations(content, availableChampions)
    const builds: Build[] = []
    const validRecommendations: ChampionData[] = []
    const validExplanations: string[] = []

    // Try to get builds for each recommendation
    for (let i = 0; i < recommendations.length; i++) {
      try {
        const build = await statsService.getChampionBuild(recommendations[i].name, targetRole)
        // Only include recommendations that have valid build data
        if (build.items[0] && build.items[0].name !== 'Error loading items') {
          builds.push(build)
          validRecommendations.push(recommendations[i])
          validExplanations.push(explanations[i])
        }
      } catch (error) {
        console.error(`Error getting build for ${recommendations[i].name}:`, error)
        // Skip this recommendation if build data is not available
        continue
      }
    }

    // If we don't have enough valid recommendations, get more
    while (validRecommendations.length < 3) {
      const newPrompt = generatePrompt(allies, enemies, targetRole, validRecommendations)
      const newResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: newPrompt }],
        temperature: 0.7,
        max_tokens: 500
      })

      const newContent = newResponse.choices[0]?.message?.content
      if (!newContent) {
        break
      }

      const { recommendations: newRecommendations, explanations: newExplanations } = 
        parseRecommendations(newContent, availableChampions)

      for (let i = 0; i < newRecommendations.length; i++) {
        if (validRecommendations.some(r => r.id === newRecommendations[i].id)) {
          continue
        }

        try {
          const build = await statsService.getChampionBuild(newRecommendations[i].name, targetRole)
          if (build.items[0] && build.items[0].name !== 'Error loading items') {
            builds.push(build)
            validRecommendations.push(newRecommendations[i])
            validExplanations.push(newExplanations[i])
            if (validRecommendations.length >= 3) {
              break
            }
          }
        } catch (error) {
          console.error(`Error getting build for ${newRecommendations[i].name}:`, error)
          continue
        }
      }

      if (validRecommendations.length < 3) {
        break // Prevent infinite loop if we can't find enough valid recommendations
      }
    }

    return {
      recommendations: validRecommendations,
      explanations: validExplanations,
      builds
    }
  } catch (error) {
    console.error('Error in getChampionRecommendations:', error)
    throw error
  }
}

function generatePrompt(
  allies: TeamMember[],
  enemies: ChampionData[],
  targetRole: Role,
  excludeChampions: ChampionData[] = []
): string {
  const excludeNames = excludeChampions.map(c => c.name).join(', ')
  const allyInfo = allies
    .map((a) => `${a.champion.name} (${a.role})`)
    .join(', ')
  const enemyInfo = enemies.map((e) => e.name).join(', ')

  return `As a League of Legends expert, recommend 3 champions for the ${targetRole} role ${
    excludeNames ? `(excluding ${excludeNames})` : ''
  } based on the following team composition:

Allies: ${allyInfo || 'None'}
Enemies: ${enemyInfo || 'None'}

Consider team synergy, counter-picks, and the current meta. Provide a brief explanation for each recommendation.

Format your response as:
Champion 1: [Name] - [Explanation]
Champion 2: [Name] - [Explanation]
Champion 3: [Name] - [Explanation]`
}

function parseRecommendations(content: string, availableChampions: ChampionData[]): { recommendations: ChampionData[]; explanations: string[] } {
  const recommendations: ChampionData[] = []
  const explanations: string[] = []
  const lines = content.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    // Try different formats that OpenAI might use
    const formats = [
      /Champion \d+:\s*([^-]+)-(.+)/, // "Champion 1: Name - Explanation"
      /(\w+(?:\s+\w+)*)\s*-\s*(.+)/, // "Name - Explanation"
      /(\w+(?:\s+\w+)*):?\s*(.+)/ // "Name: Explanation" or "Name Explanation"
    ]

    for (const format of formats) {
      const match = line.match(format)
      if (match) {
        const [, championName, explanation] = match
        const champion = availableChampions.find(
          c => c.name.toLowerCase() === championName.trim().toLowerCase()
        )
        if (champion && !recommendations.some(r => r.id === champion.id)) {
          recommendations.push(champion)
          explanations.push(explanation.trim())
          break // Found a match, move to next line
        }
      }
    }

    // Stop if we have 3 recommendations
    if (recommendations.length >= 3) break
  }

  return { recommendations, explanations }
} 