import { NextRequest, NextResponse } from 'next/server';
import { intelligentTaggingService } from '../../../../../../../frontend/lib/ai/intelligent-tagging';
// // import { performanceUtils } from '../../../../../../../frontend/lib/monitoring/performance-enhanced';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookmarks, options = {} } = body;

    // Validate input
    if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
      return NextResponse.json({
        error: 'Bookmarks array is required and must not be empty'
      }, { status: 400 });
    }

    if (bookmarks.length > 100) {
      return NextResponse.json({
        error: 'Maximum 100 bookmarks allowed per batch'
      }, { status: 400 });
    }

    // Validate bookmark structure
    for (const bookmark of bookmarks) {
      if (!bookmark.id || !bookmark.title || !bookmark.url) {
        return NextResponse.json({
          error: 'Each bookmark must have id, title, and url'
        }, { status: 400 });
      }
    }

    // Process batch tagging
//     const results = await performanceUtils.trackFunction('batch_tagging', async () => {
      return await intelligentTaggingService.generateTagsBatch(bookmarks, options);
    });

    return NextResponse.json({
      success: true,
      results,
      totalProcessed: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch tagging API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Batch tagging failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 