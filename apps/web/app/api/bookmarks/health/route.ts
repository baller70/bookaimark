import { NextRequest, NextResponse } from 'next/server'
import { loadBookmarks, saveBookmarks } from '@/lib/file-storage'

export type HealthStatus = 'excellent' | 'working' | 'fair' | 'poor' | 'broken'

interface HealthCheckResult {
  bookmarkId: number
  status: HealthStatus
  statusCode?: number
  responseTime?: number
  error?: string
  lastChecked: string
}

const checkUrlHealth = async (url: string): Promise<{ status: HealthStatus; statusCode?: number; responseTime?: number; error?: string }> => {
  const startTime = Date.now()
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookAIMark/1.0; +https://bookaimark.com)'
      }
    })

    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    // Determine health status based on response
    let status: HealthStatus
    if (response.status >= 200 && response.status < 300) {
      if (responseTime < 500) {
        status = 'excellent'
      } else if (responseTime < 1500) {
        status = 'working'
      } else {
        status = 'fair'
      }
    } else if (response.status >= 300 && response.status < 400) {
      status = 'working' // Redirects are generally okay
    } else if (response.status >= 400 && response.status < 500) {
      status = 'poor'
    } else {
      status = 'broken'
    }

    return {
      status,
      statusCode: response.status,
      responseTime,
      error: response.status >= 400 ? `HTTP ${response.status}` : undefined
    }

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 'poor',
        error: 'Request timeout',
        responseTime: Date.now() - startTime
      }
    }
    
    return {
      status: 'broken',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bookmarkIds, userId } = await request.json()
    
    if (!bookmarkIds || !Array.isArray(bookmarkIds)) {
      return NextResponse.json({ error: 'bookmarkIds array is required' }, { status: 400 })
    }

    // Load bookmarks
    const allBookmarks = await loadBookmarks()
    const userBookmarks = allBookmarks.filter(bookmark => 
      bookmark.user_id === (userId || 'dev-user-123')
    )

    const results: HealthCheckResult[] = []
    
    // Check health for each requested bookmark
    for (const bookmarkId of bookmarkIds) {
      const bookmark = userBookmarks.find(b => b.id === bookmarkId)
      if (!bookmark) {
        results.push({
          bookmarkId,
          status: 'broken',
          error: 'Bookmark not found',
          lastChecked: new Date().toISOString()
        })
        continue
      }

      console.log(`🔍 Checking health for: ${bookmark.title} (${bookmark.url})`)
      const healthResult = await checkUrlHealth(bookmark.url)
      
      results.push({
        bookmarkId,
        ...healthResult,
        lastChecked: new Date().toISOString()
      })

      // Update bookmark with new health status and increment health check count
      const bookmarkIndex = allBookmarks.findIndex(b => b.id === bookmarkId)
      if (bookmarkIndex !== -1) {
        const currentBookmark = allBookmarks[bookmarkIndex]
        allBookmarks[bookmarkIndex] = {
          ...currentBookmark,
          site_health: healthResult.status,
          last_health_check: new Date().toISOString(),
          healthCheckCount: (currentBookmark.healthCheckCount || 0) + 1
        }
      }
    }

    // Save updated bookmarks
    await saveBookmarks(allBookmarks)

    console.log(`✅ Health check completed for ${results.length} bookmarks`)
    
    return NextResponse.json({
      success: true,
      results,
      message: `Health check completed for ${results.length} bookmarks`
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { error: 'Failed to check bookmark health' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Bookmark Health Check API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      'POST /api/bookmarks/health': 'Check health status of bookmarks'
    }
  })
} 