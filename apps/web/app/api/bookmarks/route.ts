import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
// Note: Monitoring middleware would be imported here in a full implementation
// For now, we'll use console logging to maintain compatibility
// import { withMonitoring, measureDatabaseOperation } from '@/lib/middleware/monitoring';
// import { logger } from '@/lib/logger';

// File-based storage for persistent bookmarks (until Supabase credentials are fixed)
const BOOKMARKS_FILE = join(process.cwd(), 'data', 'bookmarks.json');

interface Bookmark {
  id: number;
  user_id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags?: string[];
  ai_summary?: string;
  ai_tags?: string[];
  ai_category?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  site_health?: 'excellent' | 'working' | 'fair' | 'poor' | 'broken';
  last_health_check?: string;
  healthCheckCount?: number;
  customBackground?: string;
  visits?: number;
  time_spent?: number;
  relatedBookmarks?: number[];
}

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

// Load bookmarks from file
async function loadBookmarks(): Promise<Bookmark[]> {
  // TODO: Add measureDatabaseOperation wrapper when monitoring is fully set up
  try {
    console.log('📁 Bookmarks file path:', BOOKMARKS_FILE);
    await ensureDataDirectory();
    if (!existsSync(BOOKMARKS_FILE)) {
      console.log('❌ Bookmarks file does not exist:', BOOKMARKS_FILE);
      return [];
    }
    console.log('✅ Bookmarks file exists, reading...');
    const data = await readFile(BOOKMARKS_FILE, 'utf-8');
    console.log('📄 Raw file data length:', data.length);
    const parsed = JSON.parse(data) as Bookmark[];
    console.log('📋 Parsed bookmarks count:', parsed.length);
    return parsed;
  } catch (error) {
    console.error('❌ Error loading bookmarks:', error);
    return [];
  }
}

// Save bookmarks to file
async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  try {
    await ensureDataDirectory();
    await writeFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
  } catch (error) {
    console.error('❌ Error saving bookmarks:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📖 Fetching bookmarks from file storage...');
    console.log('📂 Current working directory:', process.cwd());
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'dev-user-123';
    const allCategories = searchParams.get('all_categories') === 'true';
    
    // Load bookmarks from file
    const allBookmarks = await loadBookmarks();
    console.log(`📚 Loaded ${allBookmarks.length} total bookmarks from file`);
    
    // If requesting all categories, return unique categories from all users
    if (allCategories) {
      const uniqueCategories = [...new Set(allBookmarks.map(b => b.category).filter(Boolean))].sort();
      console.log(`📁 Found ${uniqueCategories.length} unique categories across all users:`, uniqueCategories);
      
      return NextResponse.json({
        success: true,
        categories: uniqueCategories,
        total: uniqueCategories.length
      });
    }
    
    console.log('🔍 Looking for user ID:', userId);
    console.log('📝 Available user IDs:', allBookmarks.map(b => b.user_id));
    
    // Filter bookmarks by user ID
    const userBookmarks = allBookmarks.filter(bookmark => bookmark.user_id === userId);
    console.log(`🎯 Found ${userBookmarks.length} bookmarks for user ${userId}`);
    
    console.log(`✅ Successfully loaded ${userBookmarks.length} bookmarks for user ${userId}`);
    
    // Transform bookmarks to match frontend format
    const transformedBookmarks = userBookmarks.map((bookmark, index) => ({
      id: bookmark.id,
      title: bookmark.title?.toUpperCase() || 'UNTITLED',
      url: bookmark.url,
      description: bookmark.description || 'No description available',
      category: bookmark.category || 'General',
      tags: bookmark.tags || [],
      priority: 'medium',
      isFavorite: false,
      visits: bookmark.visits || 0, // Start at 0 for new bookmarks
      lastVisited: bookmark.visits > 0 ? new Date(bookmark.created_at).toLocaleDateString() : 'Never',
      dateAdded: new Date(bookmark.created_at).toLocaleDateString(),
      favicon: bookmark.title?.charAt(0)?.toUpperCase() || 'B',
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "",
      notes: bookmark.notes || 'No notes',
      timeSpent: bookmark.time_spent ? `${bookmark.time_spent}m` : '0m', // Use actual time spent or 0
      weeklyVisits: 0, // Start at 0 for new bookmarks
      siteHealth: bookmark.site_health || 'unknown',
      site_health: bookmark.site_health || 'unknown',
      healthCheckCount: bookmark.healthCheckCount || 0,
      last_health_check: bookmark.last_health_check,
      customBackground: bookmark.customBackground,
      project: {
        name: bookmark.ai_category || "GENERAL",
        progress: 0, // Start at 0 for new bookmarks
        status: "Active"
      },
      relatedBookmarks: bookmark.relatedBookmarks || []
    }));
    
    return NextResponse.json({
      success: true,
      bookmarks: transformedBookmarks,
      total: transformedBookmarks.length
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, url, description, category, tags, ai_summary, ai_tags, ai_category, notes, customBackground, relatedBookmarks } = body;
    
    // Validate required fields
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }
    
    // Use dev user ID for bypass mode
    const userId = process.env.DEV_USER_ID || 'dev-user-123';
    
    // Load existing bookmarks
    const allBookmarks = await loadBookmarks();
    
    if (id) {
      // UPDATE existing bookmark
      console.log('📝 Updating bookmark in file storage for user:', userId, 'ID:', id);
      
      const bookmarkIndex = allBookmarks.findIndex(b => b.id === id && b.user_id === userId);
      
      if (bookmarkIndex === -1) {
        return NextResponse.json(
          { error: 'Bookmark not found' },
          { status: 404 }
        );
      }
      
      // Update existing bookmark
      const updatedBookmark: Bookmark = {
        ...allBookmarks[bookmarkIndex],
        title,
        url,
        description: description || '',
        category: category || 'General',
        tags: tags || [],
        ai_summary,
        ai_tags: ai_tags || [],
        ai_category,
        notes: notes || '',
        customBackground,
        relatedBookmarks: relatedBookmarks || [],
        updated_at: new Date().toISOString()
      };
      
      allBookmarks[bookmarkIndex] = updatedBookmark;
      
      // Save to file
      await saveBookmarks(allBookmarks);
      
      console.log('✅ Successfully updated bookmark:', updatedBookmark);
      
      return NextResponse.json({
        success: true,
        bookmark: updatedBookmark,
        message: 'Bookmark updated successfully'
      });
      
    } else {
      // CREATE new bookmark
      console.log('📝 Creating bookmark in file storage for user:', userId);
      
      // Generate new ID
      const newId = Math.max(0, ...allBookmarks.map(b => b.id)) + 1;
      
      // Create new bookmark with zero analytics
      const newBookmark: Bookmark = {
        id: newId,
        user_id: userId,
        title,
        url,
        description: description || '',
        category: category || 'General',
        tags: tags || [],
        ai_summary,
        ai_tags: ai_tags || [],
        ai_category,
        notes: notes || '',
        relatedBookmarks: relatedBookmarks || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Initialize all analytics fields to zero for new bookmarks
        visits: 0,
        time_spent: 0,
        site_health: 'working' as const,
        healthCheckCount: 0,
        last_health_check: null
      };
      
      // Add to bookmarks array
      allBookmarks.push(newBookmark);
      
      // Save to file
      await saveBookmarks(allBookmarks);
      
      console.log('✅ Successfully created bookmark:', newBookmark);
      
      return NextResponse.json({
        success: true,
        bookmark: newBookmark,
        message: 'Bookmark created successfully'
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get('id');
    const userId = searchParams.get('user_id') || 'dev-user-123';
    
    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`🗑️ Deleting bookmark ${bookmarkId} for user ${userId}`);
    
    // Load existing bookmarks
    const allBookmarks = await loadBookmarks();
    
    // Find bookmark to delete
    const bookmarkToDelete = allBookmarks.find(b => b.id === parseInt(bookmarkId) && b.user_id === userId);
    
    if (!bookmarkToDelete) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }
    
    // Remove bookmark from array
    const updatedBookmarks = allBookmarks.filter(b => !(b.id === parseInt(bookmarkId) && b.user_id === userId));
    
    // Save updated bookmarks to file
    await saveBookmarks(updatedBookmarks);
    
    console.log(`✅ Successfully deleted bookmark: ${bookmarkToDelete.title}`);
    
    return NextResponse.json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 