import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    // Testing mode bypass for development
    const isTestingMode = process.env.NODE_ENV === 'development' || process.env.STT_TESTING_MODE === 'true'
    
    if (isTestingMode) {
      console.log('🧪 TESTING MODE: STT Authentication bypassed')
    } else {
      // Production authentication
      const supabase = createRouteHandlerClient({ cookies })
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check if user has enough credits
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single()

      if (creditsError) {
        console.error('Error fetching credits:', creditsError)
        return NextResponse.json(
          { error: 'Error checking credits' },
          { status: 500 }
        )
      }

      if (!credits || credits.credits < 1) {
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 402 }
        )
      }
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const language = formData.get('language') as string || 'en'
    const prompt = formData.get('prompt') as string || ''

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert File to the format expected by OpenAI
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type })
    
    // Create a File object that OpenAI expects
    const file = new File([audioBlob], audioFile.name || 'audio.webm', {
      type: audioFile.type || 'audio/webm'
    })

    // Use OpenAI Whisper for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: language,
      prompt: prompt,
      response_format: 'json',
      temperature: 0.2
    })

    // Deduct credits in production
    if (!isTestingMode) {
      const supabase = createRouteHandlerClient({ cookies })
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('user_credits')
          .update({
            credits: supabase.rpc('decrement_credits', { user_id: user.id, amount: 1 }),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      }
    }

    return NextResponse.json({
      text: transcription.text,
      language: language,
      duration: transcription.duration || 0
    })

  } catch (error) {
    console.error('Error in STT route:', error)
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('audio')) {
        return NextResponse.json(
          { error: 'Invalid audio file format' },
          { status: 400 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error processing speech-to-text request' },
      { status: 500 }
    )
  }
} 