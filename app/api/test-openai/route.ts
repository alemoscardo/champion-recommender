import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Simple test completion with minimal tokens
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Say "API is working" if you receive this message.',
        },
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: 10,
    })

    return NextResponse.json({
      success: true,
      message: completion.choices[0]?.message?.content,
    })
  } catch (error: any) {
    console.error('OpenAI Test Error:', error)
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        type: error.type,
        code: error.code,
      },
    }, { status: 500 })
  }
} 