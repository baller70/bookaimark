import { NextRequest, NextResponse } from 'next/server'

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  environment: string
  services: {
    database: 'connected' | 'disconnected' | 'unknown'
    redis: 'connected' | 'disconnected' | 'unknown'
    filesystem: 'accessible' | 'inaccessible'
    ai: 'available' | 'unavailable' | 'unknown'
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
}

// Check database connectivity
async function checkDatabase(): Promise<'connected' | 'disconnected' | 'unknown'> {
  try {
    // For now, we're using file-based storage
    // In production, this would check Supabase connection
    const fs = require('fs').promises
    await fs.access('./data/bookmarks.json')
    return 'connected'
  } catch (error) {
    return 'disconnected'
  }
}

// Check Redis connectivity
async function checkRedis(): Promise<'connected' | 'disconnected' | 'unknown'> {
  try {
    // If Redis is configured, check connection
    if (process.env.REDIS_URL) {
      // In a real implementation, you would check Redis connection here
      return 'unknown'
    }
    return 'unknown'
  } catch (error) {
    return 'disconnected'
  }
}

// Check filesystem accessibility
async function checkFilesystem(): Promise<'accessible' | 'inaccessible'> {
  try {
    const fs = require('fs').promises
    await fs.access('./data')
    return 'accessible'
  } catch (error) {
    return 'inaccessible'
  }
}

// Check AI service availability
async function checkAI(): Promise<'available' | 'unavailable' | 'unknown'> {
  try {
    if (process.env.OPENAI_API_KEY) {
      return 'available'
    }
    return 'unknown'
  } catch (error) {
    return 'unavailable'
  }
}

// Get memory usage
function getMemoryUsage() {
  const memoryUsage = process.memoryUsage()
  const totalMemory = memoryUsage.heapTotal + memoryUsage.external
  const usedMemory = memoryUsage.heapUsed
  
  return {
    used: Math.round(usedMemory / 1024 / 1024), // MB
    total: Math.round(totalMemory / 1024 / 1024), // MB
    percentage: Math.round((usedMemory / totalMemory) * 100)
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check all services
    const [database, redis, filesystem, ai] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkFilesystem(),
      checkAI()
    ])

    const memory = getMemoryUsage()
    const responseTime = Date.now() - startTime

    // Determine overall health status
    const isHealthy = database !== 'disconnected' && 
                     filesystem === 'accessible' &&
                     memory.percentage < 90

    const healthCheck: HealthCheckResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database,
        redis,
        filesystem,
        ai
      },
      memory
    }

    const statusCode = isHealthy ? 200 : 503

    return NextResponse.json(healthCheck, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}

// Simple health check for Docker health check
export async function HEAD() {
  try {
    const filesystem = await checkFilesystem()
    const database = await checkDatabase()
    
    if (filesystem === 'accessible' && database !== 'disconnected') {
      return new NextResponse(null, { status: 200 })
    } else {
      return new NextResponse(null, { status: 503 })
    }
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
} 