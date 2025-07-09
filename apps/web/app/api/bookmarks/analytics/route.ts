import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const BOOKMARKS_FILE = path.join(DATA_DIR, 'bookmarks.json')
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Load bookmarks from file
async function loadBookmarks() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(BOOKMARKS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.log('No bookmarks file found, returning empty array')
    return []
  }
}

// Save bookmarks to file
async function saveBookmarks(bookmarks: any[]) {
  try {
    await ensureDataDir()
    await fs.writeFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2))
  } catch (error) {
    console.error('Failed to save bookmarks:', error)
    throw error
  }
}

// Load analytics from file
async function loadAnalytics() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.log('No analytics file found, returning empty object')
    return {}
  }
}

// Save analytics to file
async function saveAnalytics(analytics: any) {
  try {
    await ensureDataDir()
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2))
  } catch (error) {
    console.error('Failed to save analytics:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookmarkId, action, visits, timeSpent, sessionCount, lastVisited, weeklyVisits, monthlyVisits, sessionEndTime } = body

    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      )
    }

    // Load existing bookmarks and analytics
    const bookmarks = await loadBookmarks()
    const analytics = await loadAnalytics()

    // Find and update the bookmark
    const bookmarkIndex = bookmarks.findIndex((b: any) => b.id === bookmarkId)
    if (bookmarkIndex === -1) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      )
    }

    // Get current analytics or create new
    const currentAnalytics = analytics[bookmarkId] || {
      visits: 0,
      timeSpent: 0,
      sessionCount: 0,
      lastVisited: new Date().toISOString(),
      weeklyVisits: 0,
      monthlyVisits: 0
    }

    // Handle different actions
    let updatedAnalytics = { ...currentAnalytics }
    
    if (action === 'visit') {
      // Increment visit counts
      updatedAnalytics = {
        ...currentAnalytics,
        visits: Number(currentAnalytics.visits || 0) + 1,
        weeklyVisits: Number(currentAnalytics.weeklyVisits || 0) + 1,
        monthlyVisits: Number(currentAnalytics.monthlyVisits || 0) + 1,
        sessionCount: Number(currentAnalytics.sessionCount || 0) + 1,
        lastVisited: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    } else if (action === 'timeUpdate') {
      // Update time spent for the bookmark
      const additionalTime = timeSpent || 0
      updatedAnalytics = {
        ...currentAnalytics,
        timeSpent: Number(currentAnalytics.timeSpent || 0) + additionalTime,
        lastVisited: sessionEndTime || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log(`⏱️ Time update for bookmark ${bookmarkId}: +${additionalTime} minutes (total: ${updatedAnalytics.timeSpent} minutes)`)
    } else {
      // Handle explicit analytics updates
      updatedAnalytics = {
        ...currentAnalytics,
        visits: visits !== undefined ? visits : currentAnalytics.visits,
        timeSpent: timeSpent !== undefined ? timeSpent : currentAnalytics.timeSpent,
        sessionCount: sessionCount !== undefined ? sessionCount : currentAnalytics.sessionCount,
        lastVisited: lastVisited || currentAnalytics.lastVisited,
        weeklyVisits: weeklyVisits !== undefined ? weeklyVisits : currentAnalytics.weeklyVisits,
        monthlyVisits: monthlyVisits !== undefined ? monthlyVisits : currentAnalytics.monthlyVisits,
        updatedAt: new Date().toISOString()
      }
    }

    // Update bookmark with new analytics data
    bookmarks[bookmarkIndex] = {
      ...bookmarks[bookmarkIndex],
      visits: updatedAnalytics.visits,
      visit_count: updatedAnalytics.visits,
      time_spent: updatedAnalytics.timeSpent,
      reading_time_minutes: updatedAnalytics.timeSpent,
      session_count: updatedAnalytics.sessionCount,
      last_visited_at: updatedAnalytics.lastVisited,
      updated_at: new Date().toISOString()
    }

    // Update analytics data
    analytics[bookmarkId] = updatedAnalytics

    // Save updated data
    await saveBookmarks(bookmarks)
    await saveAnalytics(analytics)

    console.log(`📊 Updated analytics for bookmark ${bookmarkId}:`, {
      visits: updatedAnalytics.visits,
      timeSpent: updatedAnalytics.timeSpent,
      sessionCount: updatedAnalytics.sessionCount,
      weeklyVisits: updatedAnalytics.weeklyVisits,
      monthlyVisits: updatedAnalytics.monthlyVisits
    })

    return NextResponse.json({ 
      success: true, 
      analytics: updatedAnalytics,
      message: action === 'timeUpdate' ? 'Time tracking updated' : 'Analytics updated'
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('bookmarkId')

    // Load analytics data
    const analytics = await loadAnalytics()

    if (bookmarkId) {
      // Return analytics for specific bookmark
      const bookmarkAnalytics = analytics[bookmarkId]
      if (!bookmarkAnalytics) {
        return NextResponse.json(
          { error: 'Analytics not found for this bookmark' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: bookmarkAnalytics
      })
    } else {
      // Return all analytics
      const bookmarks = await loadBookmarks()
      
      // Calculate global statistics
      const globalStats = {
        totalVisits: Object.values(analytics).reduce((sum: number, a: any) => sum + (a.visits || 0), 0),
        totalBookmarks: bookmarks.length,
        activeBookmarks: Object.values(analytics).filter((a: any) => {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return new Date(a.lastVisited || 0) > weekAgo
        }).length,
        avgUsage: Object.keys(analytics).length > 0 
          ? Object.values(analytics).reduce((sum: number, a: any) => sum + (a.visits || 0), 0) / Object.keys(analytics).length
          : 0,
        topPerformer: Object.entries(analytics).reduce((max: any, [id, data]: [string, any]) => 
          (data.visits || 0) > (max.visits || 0) ? { id, ...data } : max, { visits: 0 }
        ),
        lastUpdated: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: {
          analytics,
          globalStats
        }
      })
    }

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
} 