import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  const { message } = await req.json()

  const chat = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: message }],
  })

  return NextResponse.json({ text: chat.choices[0].message.content })
} 