'use client'

import React, { useState } from 'react'
import { Search, Sparkles, ArrowRight, Plus, BookOpen, Star, Filter, Brain } from 'lucide-react'

export default function Oracle() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setIsLoading(true)
    // TODO: Implement Oracle search functionality
    console.log('Oracle search:', query)
    
    // Simulate search delay
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const suggestions = [
    { icon: Plus, text: "Create a new bookmark" },
    { icon: BookOpen, text: "Find bookmarks about AI" },
    { icon: Star, text: "Show my favorite bookmarks" },
    { icon: Filter, text: "Filter by category" }
  ]

  return (
    <div className="w-full max-w-7xl mx-auto mb-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 relative overflow-hidden">
        {/* Subtle background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 animate-pulse opacity-50"></div>
        
        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome Tom, how can the Oracle help you?
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Ask me anything about your bookmarks, or let me help you manage them
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative z-10 mb-8">
          <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
            <div className="flex items-center bg-gray-50 rounded-3xl border-2 border-gray-200 hover:border-gray-300 focus-within:border-blue-500 transition-colors duration-200">
              <Search className="w-8 h-8 text-gray-400 ml-12" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask Oracle anything about your bookmarks..."
                className="flex-1 px-12 py-10 text-2xl bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 min-w-0"
              />
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="mr-8 px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 text-xl font-medium shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Search</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setQuery(suggestion.text)}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 text-left group border border-gray-200 hover:border-gray-300"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <suggestion.icon className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-gray-700 font-medium">{suggestion.text}</span>
            </button>
          ))}
        </div>

        {/* Powered by AI badge */}
        <div className="relative z-10 flex justify-center">
          <div className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    </div>
  )
} 