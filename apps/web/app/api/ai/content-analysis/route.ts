import { NextRequest, NextResponse } from 'next/server';
import { contentAnalysisService, ContentAnalysisRequest } from '@/lib/ai/content-analysis';
import { appLogger } from '@/lib/logger';
import { withRateLimit } from '@/lib/middleware/rate-limiter';

const logger = appLogger;

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await withRateLimit(request, {
      windowMs: 60000, // 1 minute
      maxRequests: 10, // 10 requests per minute
      keyGenerator: (req) => `content-analysis:${req.ip || 'unknown'}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { url, title, description, content, html, userId, preferences } = body;

    // Validate required fields
    if (!url || !userId) {
      return NextResponse.json(
        { error: 'URL and userId are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    logger.info('Content analysis requested', {
      url: url.substring(0, 100),
      userId,
      hasContent: !!content,
      hasHtml: !!html,
      hasPreferences: !!preferences,
    });

    // Prepare analysis request
    const analysisRequest: ContentAnalysisRequest = {
      url,
      title,
      description,
      content,
      html,
      userId,
      preferences: preferences ? {
        categories: preferences.categories || [],
        interests: preferences.interests || [],
        language: preferences.language || 'en',
        analysisDepth: preferences.analysisDepth || 'detailed',
        includeKeywords: preferences.includeKeywords !== false,
        includeSentiment: preferences.includeSentiment !== false,
        includeTopics: preferences.includeTopics !== false,
        includeReadingTime: preferences.includeReadingTime !== false,
      } : undefined,
    };

    // Perform content analysis
    const result = await contentAnalysisService.analyzeContent(analysisRequest);

    logger.info('Content analysis completed', {
      url: url.substring(0, 100),
      userId,
      processingTime: result.processingTime,
      confidence: result.confidence,
      category: result.aiCategory,
      tagsCount: result.aiTags.length,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    logger.error('Content analysis failed', error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      { 
        error: 'Content analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');

    if (operation === 'health') {
      return NextResponse.json({
        success: true,
        service: 'content-analysis',
        status: 'healthy',
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid operation' },
      { status: 400 }
    );

  } catch (error) {
    logger.error('Content analysis GET request failed', error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}  