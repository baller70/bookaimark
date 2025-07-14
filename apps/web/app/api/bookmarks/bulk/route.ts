import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// File-based storage for persistent bookmarks
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

interface ImportBookmark {
  title: string;
  url: string;
  description?: string;
  category?: string;
  tags?: string[];
  notes?: string;
}

interface BulkOperationResult {
  success: boolean;
  total: number;
  processed: number;
  failed: number;
  errors: string[];
  data?: any;
  message: string;
  processing_time_ms: number;
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
  try {
    await ensureDataDirectory();
    if (!existsSync(BOOKMARKS_FILE)) {
      return [];
    }
    const data = await readFile(BOOKMARKS_FILE, 'utf-8');
    return JSON.parse(data) as Bookmark[];
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return [];
  }
}

// Save bookmarks to file
async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  try {
    await ensureDataDirectory();
    await writeFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
    throw error;
  }
}

// Validate bookmark data
function validateBookmark(bookmark: ImportBookmark): { valid: boolean; error?: string } {
  if (!bookmark.title || bookmark.title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  
  if (!bookmark.url || bookmark.url.trim().length === 0) {
    return { valid: false, error: 'URL is required' };
  }
  
  // Basic URL validation
  try {
    new URL(bookmark.url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
  
  return { valid: true };
}

// Generate unique ID for new bookmark
function generateBookmarkId(existingBookmarks: Bookmark[]): number {
  return Math.max(0, ...existingBookmarks.map(b => b.id)) + 1;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('user_id') || 'dev-user-123';
    const format = searchParams.get('format') || 'json';
    
    if (action === 'export') {
      console.log(`📤 Exporting bookmarks for user: ${userId} in format: ${format}`);
      
      const allBookmarks = await loadBookmarks();
      const userBookmarks = allBookmarks.filter(bookmark => bookmark.user_id === userId);
      
      if (format === 'json') {
        const exportData = {
          version: '1.0',
          exported_at: new Date().toISOString(),
          user_id: userId,
          total_bookmarks: userBookmarks.length,
          bookmarks: userBookmarks.map(bookmark => ({
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description,
            category: bookmark.category,
            tags: bookmark.tags || [],
            notes: bookmark.notes,
            created_at: bookmark.created_at,
            updated_at: bookmark.updated_at,
            ai_summary: bookmark.ai_summary,
            ai_tags: bookmark.ai_tags,
            ai_category: bookmark.ai_category
          }))
        };
        
        const result: BulkOperationResult = {
          success: true,
          total: userBookmarks.length,
          processed: userBookmarks.length,
          failed: 0,
          errors: [],
          data: exportData,
          message: `Successfully exported ${userBookmarks.length} bookmarks`,
          processing_time_ms: Date.now() - startTime
        };
        
        return NextResponse.json(result);
      }
      
      if (format === 'html') {
        // Export as Netscape Bookmark File Format (compatible with browsers)
        const htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${userBookmarks.map(bookmark => 
  `    <DT><A HREF="${bookmark.url}" ADD_DATE="${Math.floor(new Date(bookmark.created_at).getTime() / 1000)}"${bookmark.tags?.length ? ` TAGS="${bookmark.tags.join(',')}"` : ''}>${bookmark.title}</A>${bookmark.description ? `\n    <DD>${bookmark.description}` : ''}`
).join('\n')}
</DL><p>`;
        
        const result: BulkOperationResult = {
          success: true,
          total: userBookmarks.length,
          processed: userBookmarks.length,
          failed: 0,
          errors: [],
          data: { html: htmlContent },
          message: `Successfully exported ${userBookmarks.length} bookmarks as HTML`,
          processing_time_ms: Date.now() - startTime
        };
        
        return NextResponse.json(result);
      }
      
      return NextResponse.json(
        { error: 'Unsupported export format. Use json or html.' },
        { status: 400 }
      );
    }
    
    if (action === 'stats') {
      console.log(`📊 Getting bulk operation stats for user: ${userId}`);
      
      const allBookmarks = await loadBookmarks();
      const userBookmarks = allBookmarks.filter(bookmark => bookmark.user_id === userId);
      
      const stats = {
        total_bookmarks: userBookmarks.length,
        categories: [...new Set(userBookmarks.map(b => b.category).filter(Boolean))],
        tags: [...new Set(userBookmarks.flatMap(b => b.tags || []))],
        date_range: {
          oldest: userBookmarks.length > 0 ? Math.min(...userBookmarks.map(b => new Date(b.created_at).getTime())) : null,
          newest: userBookmarks.length > 0 ? Math.max(...userBookmarks.map(b => new Date(b.created_at).getTime())) : null
        },
        site_health_distribution: userBookmarks.reduce((acc, b) => {
          const health = b.site_health || 'unknown';
          acc[health] = (acc[health] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
      
      const result: BulkOperationResult = {
        success: true,
        total: userBookmarks.length,
        processed: userBookmarks.length,
        failed: 0,
        errors: [],
        data: stats,
        message: `Successfully retrieved stats for ${userBookmarks.length} bookmarks`,
        processing_time_ms: Date.now() - startTime
      };
      
      return NextResponse.json(result);
    }
    
    return NextResponse.json(
      { 
        error: 'Invalid action. Use action=export&format=json|html or action=stats',
        available_actions: ['export', 'stats'],
        available_formats: ['json', 'html']
      },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Bulk operation error:', error);
    
    const result: BulkOperationResult = {
      success: false,
      total: 0,
      processed: 0,
      failed: 1,
      errors: [(error as Error).message],
      message: 'Bulk operation failed',
      processing_time_ms: Date.now() - startTime
    };
    
    return NextResponse.json(result, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { action, bookmarks: importBookmarks, bookmark_ids } = body;
    const userId = body.user_id || 'dev-user-123';
    
    if (action === 'import') {
      console.log(`📥 Importing ${importBookmarks?.length || 0} bookmarks for user: ${userId}`);
      
      if (!importBookmarks || !Array.isArray(importBookmarks)) {
        return NextResponse.json(
          { error: 'bookmarks array is required for import action' },
          { status: 400 }
        );
      }
      
      const allBookmarks = await loadBookmarks();
      const errors: string[] = [];
      const processedBookmarks: Bookmark[] = [];
      let failed = 0;
      
      for (let i = 0; i < importBookmarks.length; i++) {
        const importBookmark = importBookmarks[i];
        const validation = validateBookmark(importBookmark);
        
        if (!validation.valid) {
          errors.push(`Bookmark ${i + 1}: ${validation.error}`);
          failed++;
          continue;
        }
        
        // Check for duplicates (same URL for same user)
        const existingBookmark = allBookmarks.find(b => 
          b.user_id === userId && b.url === importBookmark.url
        );
        
        if (existingBookmark) {
          errors.push(`Bookmark ${i + 1}: URL already exists - ${importBookmark.url}`);
          failed++;
          continue;
        }
        
        // Create new bookmark
        const newBookmark: Bookmark = {
          id: generateBookmarkId([...allBookmarks, ...processedBookmarks]),
          user_id: userId,
          title: importBookmark.title.trim(),
          url: importBookmark.url.trim(),
          description: importBookmark.description?.trim() || '',
          category: importBookmark.category?.trim() || 'General',
          tags: importBookmark.tags || [],
          notes: importBookmark.notes?.trim() || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visits: 0,
          time_spent: 0,
          site_health: 'working',
          healthCheckCount: 0,
          last_health_check: null,
          relatedBookmarks: []
        };
        
        processedBookmarks.push(newBookmark);
      }
      
      // Add all successful bookmarks to the database
      const updatedBookmarks = [...allBookmarks, ...processedBookmarks];
      await saveBookmarks(updatedBookmarks);
      
      const result: BulkOperationResult = {
        success: failed < importBookmarks.length,
        total: importBookmarks.length,
        processed: processedBookmarks.length,
        failed,
        errors,
        data: {
          imported_bookmarks: processedBookmarks.map(b => ({
            id: b.id,
            title: b.title,
            url: b.url,
            category: b.category
          }))
        },
        message: `Import completed: ${processedBookmarks.length} successful, ${failed} failed`,
        processing_time_ms: Date.now() - startTime
      };
      
      return NextResponse.json(result);
    }
    
    if (action === 'delete') {
      console.log(`🗑️ Bulk deleting bookmarks for user: ${userId}`);
      
      if (!bookmark_ids || !Array.isArray(bookmark_ids)) {
        return NextResponse.json(
          { error: 'bookmark_ids array is required for delete action' },
          { status: 400 }
        );
      }
      
      const allBookmarks = await loadBookmarks();
      const bookmarkIdsToDelete = bookmark_ids.map(id => parseInt(id.toString()));
      
      // Find bookmarks to delete (must belong to the user)
      const bookmarksToDelete = allBookmarks.filter(b => 
        b.user_id === userId && bookmarkIdsToDelete.includes(b.id)
      );
      
      // Remove bookmarks
      const updatedBookmarks = allBookmarks.filter(b => 
        !(b.user_id === userId && bookmarkIdsToDelete.includes(b.id))
      );
      
      await saveBookmarks(updatedBookmarks);
      
      const result: BulkOperationResult = {
        success: true,
        total: bookmark_ids.length,
        processed: bookmarksToDelete.length,
        failed: bookmark_ids.length - bookmarksToDelete.length,
        errors: bookmark_ids.length > bookmarksToDelete.length ? 
          [`${bookmark_ids.length - bookmarksToDelete.length} bookmarks not found or don't belong to user`] : [],
        data: {
          deleted_bookmarks: bookmarksToDelete.map(b => ({
            id: b.id,
            title: b.title,
            url: b.url
          }))
        },
        message: `Bulk delete completed: ${bookmarksToDelete.length} bookmarks deleted`,
        processing_time_ms: Date.now() - startTime
      };
      
      return NextResponse.json(result);
    }
    
    return NextResponse.json(
      { 
        error: 'Invalid action. Use action=import or action=delete',
        available_actions: ['import', 'delete']
      },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Bulk operation error:', error);
    
    const result: BulkOperationResult = {
      success: false,
      total: 0,
      processed: 0,
      failed: 1,
      errors: [(error as Error).message],
      message: 'Bulk operation failed',
      processing_time_ms: Date.now() - startTime
    };
    
    return NextResponse.json(result, { status: 500 });
  }
} 