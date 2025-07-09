import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Load analytics from file
async function loadAnalytics() {
  try {
    await ensureDataDir()
    console.log('Loading analytics from:', ANALYTICS_FILE)
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8')
    console.log('Analytics data loaded:', data.length, 'characters')
    const parsed = JSON.parse(data)
    console.log('Parsed analytics:', Object.keys(parsed).length, 'bookmarks')
    return parsed
  } catch (error) {
    console.log('No analytics file found, returning empty data. Error:', error.message)
    return { bookmarks: {} }
  }
}

export async function GET(request: NextRequest) {
  try {
    const analytics = await loadAnalytics()
    
    return NextResponse.json({
      success: true,
      bookmarks: analytics, // analytics is already the bookmarks object
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to load analytics:', error)
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    )
  }
} 