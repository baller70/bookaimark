'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      id: '2',
      content: "Can you help me understand my dashboard metrics?",
      isUser: true,
      timestamp: new Date(Date.now() - 240000) // 4 minutes ago
    },
    {
      id: '3',
      content: "Absolutely! Your dashboard shows great performance with 1,250 total credits, 347 messages processed, and a 98.5% success rate. You've created 12 apps this period, which is excellent progress!",
      isUser: false,
      timestamp: new Date(Date.now() - 180000) // 3 minutes ago
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when sidebar opens
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for your message! I'm here to help you with any questions about your dashboard, analytics, or account management.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <>
      {/* Toggle Button - Fixed on right edge */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 h-12 w-8 rounded-l-lg rounded-r-none border-l border-t border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200"
      >
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Button>

      {/* Chat Sidebar Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="right" 
          className="w-80 p-0 flex flex-col"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <SheetHeader className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-500 text-white text-xs">AI</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-left text-lg">AI Assistant</SheetTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Chat for help and guidance
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!message.isUser && (
                  <Avatar className="w-7 h-7 mt-1">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">AI</AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[240px] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.isUser 
                      ? 'text-blue-100' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.isUser && (
                  <Avatar className="w-7 h-7 mt-1">
                    <AvatarFallback className="bg-slate-500 text-white text-xs">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="w-7 h-7 mt-1">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">AI</AvatarFallback>
                </Avatar>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <Separator />

          {/* Input Area */}
          <div className="p-4">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                Send
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
} 