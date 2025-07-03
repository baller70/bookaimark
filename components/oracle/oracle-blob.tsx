'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Mic, 
  MicOff, 
  Send, 
  Settings, 
  VolumeX, 
  MessageCircle,
  Sparkles,
  HelpCircle,
  Search,
  Calendar,
  Zap,
  Lightbulb,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface OracleAppearanceSettings {
  primaryColor: string
  secondaryColor: string
  gradientDirection: 'linear' | 'radial' | 'conic'
  blobSize: number
  voiceVisualization: boolean
  voiceBarsCount: number
  voiceBarsHeight: number
  voiceBarsSpacing: number
  voiceBarsReactivity: number
  idleAnimation: boolean
  pulseEffect: boolean
  glowEffect: boolean
  glowIntensity: number
  floatingAnimation: boolean
  floatingSpeed: number
  rotationSpeed: number
  morphingSpeed: number
  themeIntegration: boolean
}

interface OracleVoiceSettings {
  speechToText: boolean
  textToSpeech: boolean
  voiceModel: string
  speechRate: number
  speechPitch: number
  speechVolume: number
  language: string
  autoPlayResponses: boolean
  voiceActivation: boolean
  noiseReduction: boolean
  echoCancellation: boolean
  autoGainControl: boolean
  responseFormat: string
  audioQuality: string
  microphoneSensitivity: number
  silenceThreshold: number
  recordingTimeout: number
}

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

const defaultAppearanceSettings: OracleAppearanceSettings = {
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  gradientDirection: 'linear',
  blobSize: 70,
  voiceVisualization: true,
  voiceBarsCount: 6,
  voiceBarsHeight: 0.3,
  voiceBarsSpacing: 3,
  voiceBarsReactivity: 0.8,
  idleAnimation: true,
  pulseEffect: true,
  glowEffect: true,
  glowIntensity: 0.5,
  floatingAnimation: true,
  floatingSpeed: 2,
  rotationSpeed: 20,
  morphingSpeed: 3,
  themeIntegration: false
}

const defaultVoiceSettings: OracleVoiceSettings = {
  speechToText: true,
  textToSpeech: true,
  voiceModel: 'alloy',
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 0.8,
  language: 'en',
  autoPlayResponses: false,
  voiceActivation: false,
  noiseReduction: true,
  echoCancellation: true,
  autoGainControl: true,
  responseFormat: 'mp3',
  audioQuality: 'standard',
  microphoneSensitivity: 0.7,
  silenceThreshold: 0.1,
  recordingTimeout: 30000
}

export default function OracleBlob() {
  const [isOpen, setIsOpen] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [appearanceSettings, setAppearanceSettings] = useState<OracleAppearanceSettings>(defaultAppearanceSettings)
  const [voiceSettings, setVoiceSettings] = useState<OracleVoiceSettings>(defaultVoiceSettings)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const router = useRouter()

  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  // Predefined heights for voice bars to avoid hydration issues
  const voiceBarHeights = [0.4, 0.7, 0.3, 0.9, 0.6, 0.8, 0.5, 0.4, 0.9, 0.7, 0.6, 0.8, 0.5, 0.3, 0.7]

  // Load settings from localStorage
  useEffect(() => {
    const savedAppearance = localStorage.getItem('oracleAppearanceSettings')
    const savedVoice = localStorage.getItem('oracleVoiceSettings')
    
    if (savedAppearance) {
      try {
        setAppearanceSettings(JSON.parse(savedAppearance))
      } catch (error) {
        console.error('Error loading appearance settings:', error)
      }
    }
    
    if (savedVoice) {
      try {
        setVoiceSettings(JSON.parse(savedVoice))
      } catch (error) {
        console.error('Error loading voice settings:', error)
      }
    }
  }, [])

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = () => {
      const savedAppearance = localStorage.getItem('oracleAppearanceSettings')
      const savedVoice = localStorage.getItem('oracleVoiceSettings')
      
      if (savedAppearance) {
        try {
          setAppearanceSettings(JSON.parse(savedAppearance))
        } catch (error) {
          console.error('Error loading updated appearance settings:', error)
        }
      }
      
      if (savedVoice) {
        try {
          setVoiceSettings(JSON.parse(savedVoice))
        } catch (error) {
          console.error('Error loading updated voice settings:', error)
        }
      }
    }

    window.addEventListener('oracleSettingsUpdated', handleSettingsUpdate)
    window.addEventListener('storage', handleSettingsUpdate)

    return () => {
      window.removeEventListener('oracleSettingsUpdated', handleSettingsUpdate)
      window.removeEventListener('storage', handleSettingsUpdate)
    }
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      setRecordingTime(0)
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

  const quickActions = [
    {
      id: 'summarize',
      label: 'Summarize',
      icon: <Sparkles className="h-4 w-4" />,
      description: 'Summarize the current page or selected text',
      action: () => handleQuickAction('Please summarize the current page content or any selected text. Focus on the key points and main ideas.')
    },
    {
      id: 'explain',
      label: 'Explain',
      icon: <HelpCircle className="h-4 w-4" />,
      description: 'Explain complex concepts in simple terms',
      action: () => handleQuickAction('Please explain any complex concepts on this page in simple, easy-to-understand terms. Break down technical jargon and provide clear examples.')
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="h-4 w-4" />,
      description: 'Help with intelligent search queries',
      action: () => handleQuickAction('I need help with searching for information. Please assist me in formulating effective search queries or finding specific information.')
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Assist with scheduling and time management',
      action: () => handleQuickAction('Help me with scheduling tasks, managing my time, or organizing my calendar. What would you like to schedule or organize?')
    },
    {
      id: 'enhance',
      label: 'Enhance',
      icon: <Zap className="h-4 w-4" />,
      description: 'Improve and enhance content',
      action: () => handleQuickAction('Please help me improve and enhance content. This could include writing, editing, formatting, or making suggestions for better presentation.')
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm',
      icon: <Lightbulb className="h-4 w-4" />,
      description: 'Generate ideas and creative solutions',
      action: () => handleQuickAction('Let\'s brainstorm! Help me generate creative ideas, solutions, or approaches for any challenge or project I\'m working on.')
    }
  ]

  const handleQuickAction = (prompt: string) => {
    setInputText(prompt)
    setShowQuickActions(false)
    setIsOpen(true)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: voiceSettings.echoCancellation,
          noiseSuppression: voiceSettings.noiseReduction,
          autoGainControl: voiceSettings.autoGainControl,
          sampleRate: 44100
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })
        await processAudio(audioBlob)
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
      toast.info('Processing audio...')
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('language', voiceSettings.language)
      
      const response = await fetch('/api/ai/voice/stt', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to process audio')
      }
      
      const data = await response.json()
      
      if (data.text) {
        setInputText(data.text)
        toast.success('Speech transcribed successfully')
        
        // Auto-send if enabled
        if (voiceSettings.voiceActivation) {
          await sendMessage(data.text)
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      toast.error('Failed to process audio')
    } finally {
      setIsProcessing(false)
    }
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim()
    if (!messageText) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you said: "${messageText}". This is a simulated response. In a real implementation, this would be connected to an AI service.`,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])

      // Auto-play response if enabled
      if (voiceSettings.textToSpeech && voiceSettings.autoPlayResponses) {
        playTextToSpeech(aiResponse.text)
      }
    }, 1000)
  }

  const playTextToSpeech = async (text: string) => {
    try {
      setIsPlaying(true)
      
      const response = await fetch('/api/ai/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          voice: voiceSettings.voiceModel,
          speed: voiceSettings.speechRate,
          response_format: voiceSettings.responseFormat
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
      }
      
      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio
      
      audio.volume = voiceSettings.speechVolume
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
    } catch (error) {
      console.error('Error playing text-to-speech:', error)
      toast.error('Failed to play audio')
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleBlobClick = () => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 200)
    setShowQuickActions(true)
  }

  const handleOpenChat = () => {
    setIsOpen(true)
  }

  const handleOpenSettings = () => {
    router.push('/settings/oracle')
  }

  // Generate gradient style
  const gradientStyle = {
    background: appearanceSettings.gradientDirection === 'linear' 
      ? `linear-gradient(135deg, ${appearanceSettings.primaryColor}, ${appearanceSettings.secondaryColor})`
      : appearanceSettings.gradientDirection === 'radial'
      ? `radial-gradient(circle, ${appearanceSettings.primaryColor}, ${appearanceSettings.secondaryColor})`
      : `conic-gradient(from 0deg, ${appearanceSettings.primaryColor}, ${appearanceSettings.secondaryColor}, ${appearanceSettings.primaryColor})`
  }

  return (
    <>
      {/* Quick Actions Popup */}
      {showQuickActions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-80 max-w-sm mx-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickActions(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={action.action}
                >
                  <div className="flex items-center gap-3">
                    {action.icon}
                    <div className="text-left">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenChat}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenSettings}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Oracle AI Chat</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenSettings}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-4">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation with Oracle</p>
                      <p className="text-sm">Try using voice input or quick actions</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="space-y-3">
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Recording: {formatTime(recordingTime)}</span>
                  </div>
                )}
                
                {isProcessing && (
                  <div className="flex items-center justify-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Processing audio...</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={isRecording || isProcessing}
                    />
                  </div>
                  
                  <div className="flex gap-1">
                    {voiceSettings.speechToText && (
                      <Button
                        size="sm"
                        variant={isRecording ? "destructive" : "outline"}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    )}
                    
                    {isPlaying && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={stopAudio}
                      >
                        <VolumeX className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      onClick={() => sendMessage()}
                      disabled={!inputText.trim() || isRecording || isProcessing}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Oracle Blob */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="relative flex items-center justify-center">
          <button
            onClick={handleBlobClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full animate-float hover:animate-blobPulse ${isHovered ? 'scale-110' : 'scale-100'} ${isClicked ? 'scale-95' : ''}`}
            style={{
              width: `${appearanceSettings.blobSize}px`,
              height: `${appearanceSettings.blobSize}px`,
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
              ...gradientStyle,
              boxShadow: appearanceSettings.glowEffect 
                ? `0 0 ${20 * appearanceSettings.glowIntensity * (isHovered ? 1.5 : 1)}px ${appearanceSettings.primaryColor}40, 0 0 ${40 * appearanceSettings.glowIntensity * (isHovered ? 1.5 : 1)}px ${appearanceSettings.primaryColor}20`
                : 'none',
              animation: [
                appearanceSettings.idleAnimation ? `morphBlobAdvanced ${appearanceSettings.morphingSpeed * 2}s ease-in-out infinite` : `morphBlob ${appearanceSettings.morphingSpeed}s ease-in-out infinite`,
                appearanceSettings.floatingAnimation ? `float ${appearanceSettings.floatingSpeed}s ease-in-out infinite` : '',
                appearanceSettings.pulseEffect ? `blobPulse 2s ease-in-out infinite` : '',
                appearanceSettings.glowEffect ? `glowPulse 3s ease-in-out infinite` : '',
                `rotate ${appearanceSettings.rotationSpeed}s linear infinite`
              ].filter(Boolean).join(', ') || 'float 3s ease-in-out infinite, morphBlob 6s ease-in-out infinite'
            }}
          >
            {/* Voice Visualization - Enhanced Equalizers */}
            {appearanceSettings.voiceVisualization && (
              <div 
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{ 
                  borderRadius: 'inherit',
                  gap: `${appearanceSettings.voiceBarsSpacing}px`
                }}
              >
                {Array.from({ length: appearanceSettings.voiceBarsCount }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-200 shadow-md"
                    style={{
                      width: '4px',
                      height: `${Math.min(appearanceSettings.voiceBarsHeight * voiceBarHeights[i % voiceBarHeights.length] * 45, 40)}px`,
                      minHeight: '8px',
                      background: isRecording 
                        ? `linear-gradient(to top, ${appearanceSettings.primaryColor}, ${appearanceSettings.secondaryColor})`
                        : isPlaying
                        ? `linear-gradient(to top, ${appearanceSettings.secondaryColor}, ${appearanceSettings.primaryColor})`
                        : 'rgba(255, 255, 255, 0.8)',
                      animation: (isRecording || isPlaying) 
                        ? `voiceBar${(i % 5) + 1} ${0.2 + (i * 0.03)}s ease-in-out infinite alternate`
                        : appearanceSettings.idleAnimation
                        ? `voiceBar${(i % 5) + 1} ${1.5 + (i * 0.15)}s ease-in-out infinite alternate`
                        : 'none',
                      transformOrigin: 'bottom center',
                      filter: isRecording || isPlaying ? 'brightness(1.3) saturate(1.4) drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
                      boxShadow: (isRecording || isPlaying) 
                        ? `0 0 6px ${appearanceSettings.primaryColor}40`
                        : 'none'
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Status Indicators */}
            <div className="absolute -top-1 -right-1 flex flex-col gap-1">
              {isRecording && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
              {isProcessing && (
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin" />
              )}
              {isPlaying && (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          </button>
        </div>
      </div>
    </>
  )
} 