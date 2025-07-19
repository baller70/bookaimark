import OpenAI from 'openai';
// // import { performanceUtils } from '../monitoring/performance-enhanced';
import { logger } from '../logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentAnalysisResult {
  summary: string;
  tags: string[];
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  readingTime: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  topics: string[];
  qualityScore: number;
  keyPoints: string[];
  relatedKeywords: string[];
  contentType: 'article' | 'tutorial' | 'news' | 'documentation' | 'blog' | 'research' | 'other';
}

export interface ContentMetadata {
  title: string;
  url: string;
  content: string;
  author?: string;
  publishDate?: string;
  wordCount?: number;
}

export interface AnalysisOptions {
  includeSummary?: boolean;
  includeTags?: boolean;
  includeCategory?: boolean;
  includeSentiment?: boolean;
  includeComplexity?: boolean;
  includeTopics?: boolean;
  includeKeyPoints?: boolean;
  maxSummaryLength?: number;
  maxTags?: number;
  language?: string;
}

class ContentAnalysisService {
  private readonly DEFAULT_OPTIONS: AnalysisOptions = {
    includeSummary: true,
    includeTags: true,
    includeCategory: true,
    includeSentiment: true,
    includeComplexity: true,
    includeTopics: true,
    includeKeyPoints: true,
    maxSummaryLength: 200,
    maxTags: 10,
    language: 'en'
  };

  /**
   * Analyze content using GPT-4
   */
  async analyzeContent(
    metadata: ContentMetadata,
    options: AnalysisOptions = {}
  ): Promise<ContentAnalysisResult> {
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Prepare content for analysis
      const contentToAnalyze = this.prepareContentForAnalysis(metadata);
      
      // Create analysis prompt
      const prompt = this.createAnalysisPrompt(contentToAnalyze, finalOptions);
      
      // Call GPT-4 for analysis
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content analyst. Analyze the provided content and return a structured JSON response with the requested analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || '{}');
      
      // Process and validate the result
      const result = this.processAnalysisResult(analysisResult, metadata, finalOptions);
      
      logger.info('Content analysis completed', {
        contentLength: metadata.content.length,
        summary: result.summary.substring(0, 100) + '...',
        tags: result.tags,
        category: result.category
      });
      
      return result;
      
    } catch (error) {
      logger.error('Content analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return fallback analysis
      return this.getFallbackAnalysis(metadata);
    }
  }

  /**
   * Analyze multiple pieces of content in batch
   */
  async analyzeContentBatch(
    contentList: ContentMetadata[],
    options: AnalysisOptions = {}
  ): Promise<ContentAnalysisResult[]> {
    const results: ContentAnalysisResult[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < contentList.length; i += batchSize) {
      const batch = contentList.slice(i, i + batchSize);
      
      const batchPromises = batch.map(content => 
        this.analyzeContent(content, options)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          logger.error('Batch analysis failed for item', {
            error: result.reason
          });
          results.push(this.getFallbackAnalysis(batch[index]));
        }
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < contentList.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Extract content from URL
   */
  async extractContentFromUrl(url: string): Promise<ContentMetadata> {
    try {
      // Simple content extraction using fetch
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BookAIMark Content Analyzer 1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const extracted = this.extractContentFromHtml(html);
      
      return {
        title: extracted.title || 'Untitled',
        url,
        content: extracted.content,
        author: extracted.author,
        publishDate: extracted.publishDate,
        wordCount: extracted.content.split(/\s+/).length
      };
      
    } catch (error) {
      logger.error('Content extraction failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        title: 'Content Extraction Failed',
        url,
        content: 'Unable to extract content from this URL.',
        wordCount: 0
      };
    }
  }

  /**
   * Generate AI-powered suggestions for similar content
   */
  async generateSimilarContentSuggestions(
    analysis: ContentAnalysisResult,
    count: number = 5
  ): Promise<string[]> {
    try {
      const prompt = `Based on this content analysis:
- Summary: ${analysis.summary}
- Tags: ${analysis.tags.join(', ')}
- Category: ${analysis.category}
- Topics: ${analysis.topics.join(', ')}

Generate ${count} specific search queries or topics that would help find similar, related, or complementary content. Return as a JSON array of strings.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a content discovery expert. Generate relevant search queries for finding similar content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return result.suggestions || [];
      
    } catch (error) {
      logger.error('Similar content suggestions failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return [];
    }
  }

  /**
   * Prepare content for analysis by cleaning and truncating
   */
  private prepareContentForAnalysis(metadata: ContentMetadata): string {
    let content = metadata.content;
    
    // Clean content
    content = content.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long (GPT-4 token limit consideration)
    const maxLength = 8000; // Approximately 2000 tokens
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }
    
    return `Title: ${metadata.title}\nURL: ${metadata.url}\nContent: ${content}`;
  }

  /**
   * Create analysis prompt based on options
   */
  private createAnalysisPrompt(content: string, options: AnalysisOptions): string {
    const tasks = [];
    
    if (options.includeSummary) {
      tasks.push(`- summary: A concise summary in ${options.maxSummaryLength} words or less`);
    }
    
    if (options.includeTags) {
      tasks.push(`- tags: Up to ${options.maxTags} relevant tags as an array`);
    }
    
    if (options.includeCategory) {
      tasks.push(`- category: Primary category (technology, business, science, education, entertainment, news, health, finance, lifestyle, other)`);
    }
    
    if (options.includeSentiment) {
      tasks.push(`- sentiment: Overall sentiment (positive, negative, neutral)`);
    }
    
    if (options.includeComplexity) {
      tasks.push(`- complexity: Content complexity level (beginner, intermediate, advanced)`);
    }
    
    if (options.includeTopics) {
      tasks.push(`- topics: Main topics covered as an array`);
    }
    
    if (options.includeKeyPoints) {
      tasks.push(`- keyPoints: Key takeaways as an array`);
    }
    
    tasks.push(`- readingTime: Estimated reading time in minutes`);
    tasks.push(`- language: Primary language code (en, es, fr, etc.)`);
    tasks.push(`- qualityScore: Content quality score from 1-10`);
    tasks.push(`- relatedKeywords: Related keywords as an array`);
    tasks.push(`- contentType: Type of content (article, tutorial, news, documentation, blog, research, other)`);
    
    return `Analyze the following content and provide a JSON response with these fields:
${tasks.join('\n')}

Content to analyze:
${content}

Return only valid JSON.`;
  }

  /**
   * Process and validate analysis result
   */
  private processAnalysisResult(
    result: any,
    metadata: ContentMetadata,
    options: AnalysisOptions
  ): ContentAnalysisResult {
    return {
      summary: result.summary || 'No summary available',
      tags: Array.isArray(result.tags) ? result.tags.slice(0, options.maxTags) : [],
      category: result.category || 'other',
      sentiment: ['positive', 'negative', 'neutral'].includes(result.sentiment) 
        ? result.sentiment : 'neutral',
      readingTime: Math.max(1, Math.ceil((metadata.wordCount || 0) / 200)),
      complexity: ['beginner', 'intermediate', 'advanced'].includes(result.complexity) 
        ? result.complexity : 'intermediate',
      language: result.language || 'en',
      topics: Array.isArray(result.topics) ? result.topics : [],
      qualityScore: Math.min(10, Math.max(1, result.qualityScore || 5)),
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
      relatedKeywords: Array.isArray(result.relatedKeywords) ? result.relatedKeywords : [],
      contentType: ['article', 'tutorial', 'news', 'documentation', 'blog', 'research', 'other']
        .includes(result.contentType) ? result.contentType : 'other'
    };
  }

  /**
   * Get fallback analysis when AI analysis fails
   */
  private getFallbackAnalysis(metadata: ContentMetadata): ContentAnalysisResult {
    const words = metadata.content.split(/\s+/).length;
    
    return {
      summary: `Content from ${metadata.url}. ${metadata.content.substring(0, 100)}...`,
      tags: this.extractBasicTags(metadata.content),
      category: 'other',
      sentiment: 'neutral',
      readingTime: Math.max(1, Math.ceil(words / 200)),
      complexity: 'intermediate',
      language: 'en',
      topics: [],
      qualityScore: 5,
      keyPoints: [],
      relatedKeywords: [],
      contentType: 'other'
    };
  }

  /**
   * Extract basic tags from content using simple keyword extraction
   */
  private extractBasicTags(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Extract content from HTML
   */
  private extractContentFromHtml(html: string): {
    title: string;
    content: string;
    author?: string;
    publishDate?: string;
  } {
    // Simple HTML parsing - in production, use a proper HTML parser
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Remove script and style tags
    let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Extract text content
    content = content.replace(/<[^>]+>/g, ' ');
    content = content.replace(/\s+/g, ' ').trim();
    
    // Extract author (basic meta tag extraction)
    const authorMatch = html.match(/<meta[^>]*name=["\']author["\'][^>]*content=["\']([^"\']+)["\'][^>]*>/i);
    const author = authorMatch ? authorMatch[1] : undefined;
    
    // Extract publish date
    const dateMatch = html.match(/<meta[^>]*property=["\']article:published_time["\'][^>]*content=["\']([^"\']+)["\'][^>]*>/i);
    const publishDate = dateMatch ? dateMatch[1] : undefined;
    
    return {
      title,
      content,
      author,
      publishDate
    };
  }
}

// Export singleton instance
export const contentAnalysisService = new ContentAnalysisService();

// Export utility functions
export const contentAnalysisUtils = {
  /**
   * Quick content analysis for bookmarks
   */
  analyzeBookmark: async (url: string, title: string, description?: string): Promise<ContentAnalysisResult> => {
    try {
      // Try to extract content from URL
      const metadata = await contentAnalysisService.extractContentFromUrl(url);
      
      // If extraction failed, use provided data
      if (metadata.content === 'Unable to extract content from this URL.') {
        metadata.title = title;
        metadata.content = description || title;
      }
      
      return await contentAnalysisService.analyzeContent(metadata);
      
    } catch (error) {
      logger.error('Bookmark analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return basic analysis
      return {
        summary: description || title,
        tags: title.toLowerCase().split(/\s+/).filter(word => word.length > 3),
        category: 'other',
        sentiment: 'neutral',
        readingTime: 1,
        complexity: 'intermediate',
        language: 'en',
        topics: [],
        qualityScore: 5,
        keyPoints: [],
        relatedKeywords: [],
        contentType: 'other'
      };
    }
  },

  /**
   * Analyze existing bookmark content
   */
  analyzeExistingContent: async (title: string, content: string, url: string): Promise<ContentAnalysisResult> => {
    const metadata: ContentMetadata = {
      title,
      url,
      content,
      wordCount: content.split(/\s+/).length
    };
    
    return await contentAnalysisService.analyzeContent(metadata);
  },

  /**
   * Get content suggestions based on analysis
   */
  getSimilarContentSuggestions: async (analysis: ContentAnalysisResult, count: number = 5): Promise<string[]> => {
    return await contentAnalysisService.generateSimilarContentSuggestions(analysis, count);
  }
};    