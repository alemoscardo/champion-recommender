import { GoogleGenerativeAI } from '@google/generative-ai';
import { type Role } from './champion';
import { ChampionData } from './champion';
import { statsService } from './stats';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL_ID = "gemini-pro";

interface TeamMember {
	champion: ChampionData;
	role: Role;
}

export async function getChampionRecommendationsGemini(
	allies: TeamMember[],
	enemies: ChampionData[],
	targetRole: Role,
	availableChampions: ChampionData[]
) {
	try {
		const prompt = generatePrompt(allies, enemies, targetRole);
		const model = genAI.getGenerativeModel({ model: MODEL_ID });
		
		const result = await model.generateContent({
			contents: [{
				parts: [{ text: prompt }]
			}],
			generationConfig: {
				temperature: 0.7,
				topK: 1,
				topP: 1,
				maxOutputTokens: 2048,
			},
		});

		const text = result.response.text();
		
		if (!text) {
			throw new Error('No response from Gemini');
		}

		const { recommendations, explanations } = parseRecommendations(text, availableChampions);
		const builds = await Promise.all(
			recommendations.map(champion => 
				statsService.getChampionBuild(champion.name, targetRole)
			)
		);

		return { recommendations, explanations, builds };
	} catch (error) {
		console.error('Error in getChampionRecommendationsGemini:', error);
		throw error;
	}
}

function generatePrompt(
	allies: TeamMember[],
	enemies: ChampionData[],
	targetRole: Role,
	excludeChampions: ChampionData[] = []
): string {
	const excludeNames = excludeChampions.map(c => c.name).join(', ');
	const allyInfo = allies.map(a => `${a.champion.name} (${a.role})`).join(', ');
	const enemyInfo = enemies.map(e => e.name).join(', ');

	return `As a League of Legends expert, recommend 3 champions for the ${targetRole} role ${
		excludeNames ? `(excluding ${excludeNames})` : ''
	} based on the following team composition:

Allies: ${allyInfo || 'None'}
Enemies: ${enemyInfo || 'None'}

Consider team synergy, counter-picks, and the current meta. Provide a brief explanation for each recommendation.

Format your response as:
Champion 1: [Name] - [Explanation]
Champion 2: [Name] - [Explanation]
Champion 3: [Name] - [Explanation]`;
}

function parseRecommendations(content: string, availableChampions: ChampionData[]): { recommendations: ChampionData[]; explanations: string[] } {
	const recommendations: ChampionData[] = [];
	const explanations: string[] = [];
	const lines = content.split('\n').filter(line => line.trim());
	
	for (const line of lines) {
		const formats = [
			/Champion \d+:\s*([^-]+)-(.+)/,
			/(\w+(?:\s+\w+)*)\s*-\s*(.+)/,
			/(\w+(?:\s+\w+)*):?\s*(.+)/
		];

		for (const format of formats) {
			const match = line.match(format);
			if (match) {
				const [, championName, explanation] = match;
				const champion = availableChampions.find(
					c => c.name.toLowerCase() === championName.trim().toLowerCase()
				);
				if (champion && !recommendations.some(r => r.id === champion.id)) {
					recommendations.push(champion);
					explanations.push(explanation.trim());
					break;
				}
			}
		}

		if (recommendations.length >= 3) break;
	}

	return { recommendations, explanations };
}
