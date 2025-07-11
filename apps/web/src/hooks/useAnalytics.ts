import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface AnalyticsData {
  overview: {
    totalBookmarks: number
    totalVisits: number
    engagementScore: number
    growthRate: number
    timeSpent: number
    productivityScore: number
  }
  timeTracking: {
    dailyAverage: number
    weeklyPattern: Array<{ day: string; hours: number }>
    peakHours: Array<{ hour: string; productivity: number }>
    totalHours: number
    sessionsCompleted: number
    focusScore: number
  }
  bookmarkInsights: {
    topPerformers: Array<{
      name: string
      visits: number
      timeSpent: number
      productivity: number
    }>
    underperformers: Array<{
      name: string
      visits: number
      lastVisited: string
      category: string
    }>
    unusedBookmarks: Array<{
      name: string
      daysUnused: number
      category: string
    }>
  }
  categoryAnalysis: {
    categories: Array<{
      name: string
      efficiency: number
      timeSpent: number
      bookmarkCount: number
    }>
    productivityByCategory: Array<{
      category: string
      score: number
    }>
  }
  projectManagement: {
    activeProjects: Array<{
      name: string
      progress: number
      deadline: string
      status: string
    }>
    resourceAllocation: Array<{
      resource: string
      utilization: number
    }>
  }
  smartRecommendations: {
    cleanup: Array<{
      type: string
      count: number
      impact: string
    }>
    optimization: Array<{
      suggestion: string
      benefit: string
      effort: string
    }>
    trending: Array<{
      item: string
      growth: number
      category: string
    }>
  }
}

interface UseAnalyticsOptions {
  timeRange?: '7d' | '30d' | '90d' | '1y'
  section?: keyof AnalyticsData
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null
  loading: boolean
  error: string | null
  lastUpdated: string | null
  refetch: () => Promise<void>
  updateTimeRange: (range: '7d' | '30d' | '90d' | '1y') => void
}

interface BookmarkAnalytics {
  id: number
  visits: number
  timeSpent: number
  sessionCount: number
  weeklyVisits: number
  monthlyVisits: number
  usagePercentage: number
  lastVisited: string
  isActive: boolean
  trendDirection: 'up' | 'down' | 'stable'
}

interface GlobalAnalytics {
  totalVisits: number
  totalBookmarks: number
  avgUsage: number
  activeBookmarks: number
  topPerformer: number | null
}

export function useAnalytics(bookmarks: any[]) {
  const [analyticsData, setAnalyticsData] = useState<Map<number, BookmarkAnalytics>>(new Map())
  const [globalStats, setGlobalStats] = useState<GlobalAnalytics>({
    totalVisits: 0,
    totalBookmarks: 0,
    avgUsage: 0,
    activeBookmarks: 0,
    topPerformer: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Circuit breaker state to prevent infinite loops
  const [failureCount, setFailureCount] = useState(0)
  const [lastFailureTime, setLastFailureTime] = useState<number | null>(null)
  const MAX_FAILURES = 3
  const FAILURE_RESET_TIME = 60000 // 1 minute

  // Helper function to calculate usage percentage
  const calculateUsagePercentage = useCallback((visits: number, totalVisits: number) => {
    if (totalVisits === 0) return 0
    return Math.round((visits / totalVisits) * 100)
  }, [])

  // Helper function to calculate trend direction
  const calculateTrend = useCallback((currentVisits: number, weeklyVisits: number) => {
    if (weeklyVisits === 0) return 'stable'
    if (currentVisits > weeklyVisits * 1.2) return 'up'
    if (currentVisits < weeklyVisits * 0.8) return 'down'
    return 'stable'
  }, [])

  // Check if circuit breaker should prevent API calls
  const shouldSkipApiCall = useCallback(() => {
    if (failureCount < MAX_FAILURES) return false
    
    const now = Date.now()
    if (lastFailureTime && (now - lastFailureTime) > FAILURE_RESET_TIME) {
      // Reset failure count after timeout
      setFailureCount(0)
      setLastFailureTime(null)
      return false
    }
    
    return failureCount >= MAX_FAILURES
  }, [failureCount, lastFailureTime])

  // Load initial analytics data
  const loadAnalytics = useCallback(async () => {
    if (shouldSkipApiCall()) {
      console.log('⚠️ Analytics API calls temporarily disabled due to repeated failures')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/analytics')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const analyticsMap = new Map<number, BookmarkAnalytics>()
      
      // Process analytics data
      let totalVisits = 0
      let maxVisits = 0
      let topBookmarkId = null
      
      bookmarks.forEach(bookmark => {
        const analytics = data.bookmarks?.[bookmark.id] || {
          visits: bookmark.visits || 0,
          timeSpent: 0,
          sessionCount: 0,
          weeklyVisits: 0,
          monthlyVisits: 0
        }
        
        totalVisits += analytics.visits
        
        if (analytics.visits > maxVisits) {
          maxVisits = analytics.visits
          topBookmarkId = bookmark.id
        }
        
        analyticsMap.set(bookmark.id, {
          id: bookmark.id,
          visits: analytics.visits,
          timeSpent: analytics.timeSpent,
          sessionCount: analytics.sessionCount,
          weeklyVisits: analytics.weeklyVisits,
          monthlyVisits: analytics.monthlyVisits,
          usagePercentage: calculateUsagePercentage(analytics.visits, totalVisits || 1),
          lastVisited: analytics.lastVisited || new Date().toISOString(),
          isActive: analytics.visits > 0,
          trendDirection: calculateTrend(analytics.visits, analytics.weeklyVisits)
        })
      })
      
      // Update usage percentages after calculating total visits
      analyticsMap.forEach((analytics, id) => {
        analytics.usagePercentage = calculateUsagePercentage(analytics.visits, totalVisits || 1)
      })
      
      setAnalyticsData(analyticsMap)
      setGlobalStats({
        totalVisits,
        totalBookmarks: bookmarks.length,
        avgUsage: totalVisits / (bookmarks.length || 1),
        activeBookmarks: Array.from(analyticsMap.values()).filter(a => a.isActive).length,
        topPerformer: topBookmarkId
      })
      setLastUpdated(new Date())
      
      // Reset failure count on success
      setFailureCount(0)
      setLastFailureTime(null)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      
      // Increment failure count and record failure time
      setFailureCount(prev => prev + 1)
      setLastFailureTime(Date.now())
    } finally {
      setIsLoading(false)
    }
  }, [bookmarks, calculateUsagePercentage, calculateTrend, shouldSkipApiCall])

  // Track a visit and update analytics in real-time
  const trackVisit = useCallback(async (bookmarkId: number) => {
    try {
      // Optimistically update local state
      setAnalyticsData(prev => {
        const newMap = new Map(prev)
        const current = newMap.get(bookmarkId) || {
          id: bookmarkId,
          visits: 0,
          timeSpent: 0,
          sessionCount: 0,
          weeklyVisits: 0,
          monthlyVisits: 0,
          usagePercentage: 0,
          lastVisited: new Date().toISOString(),
          isActive: true,
          trendDirection: 'stable' as const
        }
        
        const updated = {
          ...current,
          visits: current.visits + 1,
          weeklyVisits: current.weeklyVisits + 1,
          monthlyVisits: current.monthlyVisits + 1,
          lastVisited: new Date().toISOString(),
          isActive: true,
          trendDirection: 'up' as const
        }
        
        newMap.set(bookmarkId, updated)
        return newMap
      })

      // Update global stats
      setGlobalStats(prev => ({
        ...prev,
        totalVisits: prev.totalVisits + 1,
        avgUsage: (prev.totalVisits + 1) / prev.totalBookmarks
      }))

      // Send to server
      await fetch('/api/bookmarks/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookmarkId, 
          action: 'visit',
          timestamp: new Date().toISOString()
        })
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to track visit:', error)
    }
  }, [])

  // Get analytics for a specific bookmark
  const getBookmarkAnalytics = useCallback((bookmarkId: number): BookmarkAnalytics | null => {
    return analyticsData.get(bookmarkId) || null
  }, [analyticsData])

  // Setup real-time updates
  useEffect(() => {
    // Only load analytics if we have bookmarks
    if (bookmarks.length > 0) {
      loadAnalytics()
    }
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      if (bookmarks.length > 0) {
        loadAnalytics()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [bookmarks.length]) // Only depend on bookmarks.length, not the entire bookmarks array or loadAnalytics function

  return {
    analyticsData,
    globalStats,
    isLoading,
    lastUpdated,
    trackVisit,
    getBookmarkAnalytics,
    refreshAnalytics: loadAnalytics
  }
}

// Hook for tracking bookmark visits
export function useBookmarkTracking() {
  const trackBookmarkVisit = useCallback(async (bookmarkId: string, readingTime?: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      // Update visit count and last visited time
      const updates: any = {
        visit_count: supabase.rpc('increment_visit_count', { bookmark_id: bookmarkId }),
        last_visited_at: new Date().toISOString()
      }

      if (readingTime) {
        updates.reading_time_minutes = readingTime
      }

      await supabase
        .from('user_bookmarks')
        .update(updates)
        .eq('id', bookmarkId)
        .eq('user_id', session.user.id)

    } catch (error) {
      console.error('Failed to track bookmark visit:', error)
    }
  }, [])

  const trackPomodoroSession = useCallback(async (sessionData: {
    taskId?: string
    taskTitle?: string
    duration: number
    type: 'work' | 'shortBreak' | 'longBreak'
    isCompleted: boolean
    wasInterrupted?: boolean
  }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      await supabase
        .from('user_pomodoro_sessions')
        .insert({
          user_id: session.user.id,
          task_id: sessionData.taskId || null,
          task_title: sessionData.taskTitle || null,
          start_time: new Date().toISOString(),
          end_time: sessionData.isCompleted ? new Date().toISOString() : null,
          duration: sessionData.duration,
          type: sessionData.type,
          is_completed: sessionData.isCompleted,
          was_interrupted: sessionData.wasInterrupted || false
        })

    } catch (error) {
      console.error('Failed to track pomodoro session:', error)
    }
  }, [])

  return {
    trackBookmarkVisit,
    trackPomodoroSession
  }
}

// Real-time analytics updates using Supabase subscriptions
export function useRealtimeAnalytics() {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel('analytics-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_bookmarks' },
        () => setLastUpdate(new Date().toISOString())
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_pomodoro_sessions' },
        () => setLastUpdate(new Date().toISOString())
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_tasks' },
        () => setLastUpdate(new Date().toISOString())
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { lastUpdate }
} 