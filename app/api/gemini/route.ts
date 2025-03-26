import { NextRequest, NextResponse } from "next/server";
import { getChampionRecommendationsGemini } from "@/lib/services/gemini";
import { championService } from '@/lib/services/champion';
import { type Role } from '@/lib/services/champion';

export async function POST(req: NextRequest) {
	try {
		const { allies, enemies, targetRole } = await req.json();
		
		if (!targetRole || !['Top', 'Jungle', 'Mid', 'ADC', 'Support'].includes(targetRole)) {
			return NextResponse.json(
				{ error: "Invalid target role" },
				{ status: 400 }
			);
		}

		await championService.initialize();
		const availableChampions = championService.getAllChampions();

		const { recommendations, explanations, builds } = await getChampionRecommendationsGemini(
			allies,
			enemies,
			targetRole as Role,
			availableChampions
		);

		return NextResponse.json({ recommendations, explanations, builds });
	} catch (error) {
		console.error('Error in Gemini API route:', error);
		return NextResponse.json(
			{ error: "Failed to generate recommendations" },
			{ status: 500 }
		);
	}
}