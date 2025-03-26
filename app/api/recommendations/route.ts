import { NextResponse } from 'next/server'
import { championService } from '@/lib/services/champion'
import { getChampionRecommendations } from '@/lib/services/openai'
import { getChampionRecommendationsGemini } from '@/lib/services/gemini'
import { type Role } from '@/lib/services/champion'

export async function POST(request: Request) {
  try {
    const { allies, enemies, targetRole, useOpenAI } = await request.json()

    if (!targetRole || !['Top', 'Jungle', 'Mid', 'ADC', 'Support'].includes(targetRole)) {
      return NextResponse.json(
      { error: 'Invalid target role' },
      { status: 400 }
      )
    }

    await championService.initialize()
    const availableChampions = championService.getAllChampions()

    // Ensure allies is properly formatted as TeamMember[]
    const formattedAllies = allies.map((ally: any) => ({
      champion: ally.champion,
      role: ally.role as Role
    }))

    const getRecommendations = useOpenAI 
      ? getChampionRecommendations 
      : getChampionRecommendationsGemini

    const { recommendations, explanations, builds } = await getRecommendations(
      formattedAllies,
      enemies,
      targetRole as Role,
      availableChampions
    )

    return NextResponse.json({ recommendations, explanations, builds })
  } catch (error: any) {
    console.error('Error in recommendations API:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get recommendations',
        code: error.code
      },
      { status: error.code === 'insufficient_quota' ? 402 : 500 }
    )
  }
} 