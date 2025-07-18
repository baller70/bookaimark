import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { isOracleEnabled, createOracleDisabledResponse } from '@/lib/oracle-state'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    // Check if Oracle is enabled before processing
    const oracleEnabled = await isOracleEnabled()
    if (!oracleEnabled) {
      console.log('🚫 TTS API blocked - Oracle is disabled')
      return NextResponse.json(
        createOracleDisabledResponse(),
        { status: 403 }
      )
    }
    
    // Testing mode bypass for development
    const isTestingMode = process.env.NODE_ENV === 'development' || process.env.TTS_TESTING_MODE === 'true'
    
    if (isTestingMode) {
      console.log('🧪 TESTING MODE: TTS Authentication bypassed')
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

    const body = await req.json()
    const { text, voice = 'alloy', speed = 1.0, response_format = 'mp3' } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    if (text.length > 4096) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 4096 characters.' },
        { status: 400 }
      )
    }

    // Validate voice model
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
    if (!validVoices.includes(voice)) {
      return NextResponse.json(
        { error: 'Invalid voice model' },
        { status: 400 }
      )
    }

    // Validate response format
    const validFormats = ['mp3', 'opus', 'aac', 'flac']
    if (!validFormats.includes(response_format)) {
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 400 }
      )
    }

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed: Math.max(0.25, Math.min(4.0, speed)), // Clamp speed between 0.25 and 4.0
      response_format: response_format as 'mp3' | 'opus' | 'aac' | 'flac'
    })

    // Get the audio buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

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

    // Set appropriate headers for audio response
    const headers = new Headers()
    headers.set('Content-Type', `audio/${response_format}`)
    headers.set('Content-Length', buffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

    return new NextResponse(buffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error in TTS route:', error)
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      if (error.message.includes('content policy')) {
        return NextResponse.json(
          { error: 'Text violates content policy' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error processing text-to-speech request' },
      { status: 500 }
    )
  }
} 