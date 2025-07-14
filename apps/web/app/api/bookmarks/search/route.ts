import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
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

interface SearchFilters {
  query?: string;
  categories?: string[];
  tags?: string[];
  site_health?: string[];
  date_from?: string;
  date_to?: string;
  has_notes?: boolean;
  has_ai_summary?: boolean;
  min_visits?: number;
  max_visits?: number;
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'visits' | 'relevance';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface SearchResult {
  success: boolean;
  bookmarks: any[];
  total: number;
  filtered: number;
  page: number;
  per_page: number;
  total_pages: number;
  filters_applied: SearchFilters;
  search_time_ms: number;
  facets: {
    categories: { name: string; count: number }[];
    tags: { name: string; count: number }[];
    site_health: { name: string; count: number }[];
    date_ranges: {
      last_week: number;
      last_month: number;
      last_year: number;
      older: number;
    };
  };
}

// Load bookmarks from file
async function loadBookmarks(): Promise<Bookmark[]> {
  try {
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

// Calculate text similarity score (simple implementation)
function calculateRelevanceScore(bookmark: Bookmark, query: string): number {
  if (!query) return 1;
  
  const searchTerms = query.toLowerCase().split(/\s+/);
  const searchableText = [
    bookmark.title,
    bookmark.description,
    bookmark.notes,
    bookmark.ai_summary,
    ...(bookmark.tags || []),
    ...(bookmark.ai_tags || []),
    bookmark.category,
    bookmark.ai_category
  ].filter(Boolean).join(' ').toLowerCase();
  
  let score = 0;
  let maxScore = 0;
  
  for (const term of searchTerms) {
    maxScore += 3; // Max points per term
    
    // Exact match in title (highest weight)
    if (bookmark.title.toLowerCase().includes(term)) {
      score += 3;
    }
    // Match in tags (medium weight)
    else if ((bookmark.tags || []).some(tag => tag.toLowerCase().includes(term))) {
      score += 2;
    }
    // Match in other fields (lower weight)
    else if (searchableText.includes(term)) {
      score += 1;
    }
  }
  
  return maxScore > 0 ? score / maxScore : 0;
}

// Apply search filters to bookmarks
function applyFilters(bookmarks: Bookmark[], filters: SearchFilters): Bookmark[] {
  let filtered = bookmarks;
  
  // Text search
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(bookmark => {
      const searchableText = [
        bookmark.title,
        bookmark.description,
        bookmark.notes,
        bookmark.ai_summary,
        ...(bookmark.tags || []),
        ...(bookmark.ai_tags || []),
        bookmark.category,
        bookmark.ai_category,
        bookmark.url
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(query);
    });
  }
  
  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(bookmark => 
      filters.categories!.includes(bookmark.category) ||
      (bookmark.ai_category && filters.categories!.includes(bookmark.ai_category))
    );
  }
  
  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(bookmark => {
      const allTags = [...(bookmark.tags || []), ...(bookmark.ai_tags || [])];
      return filters.tags!.some(tag => allTags.includes(tag));
    });
  }
  
  // Site health filter
  if (filters.site_health && filters.site_health.length > 0) {
    filtered = filtered.filter(bookmark => 
      bookmark.site_health && filters.site_health!.includes(bookmark.site_health)
    );
  }
  
  // Date range filter
  if (filters.date_from) {
    const fromDate = new Date(filters.date_from);
    filtered = filtered.filter(bookmark => 
      new Date(bookmark.created_at) >= fromDate
    );
  }
  
  if (filters.date_to) {
    const toDate = new Date(filters.date_to);
    toDate.setHours(23, 59, 59, 999); // End of day
    filtered = filtered.filter(bookmark => 
      new Date(bookmark.created_at) <= toDate
    );
  }
  
  // Notes filter
  if (filters.has_notes !== undefined) {
    filtered = filtered.filter(bookmark => 
      filters.has_notes ? 
        (bookmark.notes && bookmark.notes.trim().length > 0) :
        (!bookmark.notes || bookmark.notes.trim().length === 0)
    );
  }
  
  // AI summary filter
  if (filters.has_ai_summary !== undefined) {
    filtered = filtered.filter(bookmark => 
      filters.has_ai_summary ? 
        (bookmark.ai_summary && bookmark.ai_summary.trim().length > 0) :
        (!bookmark.ai_summary || bookmark.ai_summary.trim().length === 0)
    );
  }
  
  // Visits range filter
  if (filters.min_visits !== undefined) {
    filtered = filtered.filter(bookmark => 
      (bookmark.visits || 0) >= filters.min_visits!
    );
  }
  
  if (filters.max_visits !== undefined) {
    filtered = filtered.filter(bookmark => 
      (bookmark.visits || 0) <= filters.max_visits!
    );
  }
  
  return filtered;
}

// Sort bookmarks based on criteria
function sortBookmarks(bookmarks: Bookmark[], sortBy: string, sortOrder: string, query?: string): Bookmark[] {
  const sorted = [...bookmarks];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      case 'visits':
        comparison = (a.visits || 0) - (b.visits || 0);
        break;
      case 'relevance':
        if (query) {
          const scoreA = calculateRelevanceScore(a, query);
          const scoreB = calculateRelevanceScore(b, query);
          comparison = scoreB - scoreA; // Higher relevance first
        } else {
          comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        break;
      default:
        comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}

// Generate facets for search results
function generateFacets(bookmarks: Bookmark[]) {
  const categories = bookmarks.reduce((acc, bookmark) => {
    const category = bookmark.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    if (bookmark.ai_category && bookmark.ai_category !== category) {
      acc[bookmark.ai_category] = (acc[bookmark.ai_category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const tags = bookmarks.reduce((acc, bookmark) => {
    [...(bookmark.tags || []), ...(bookmark.ai_tags || [])].forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const siteHealth = bookmarks.reduce((acc, bookmark) => {
    const health = bookmark.site_health || 'unknown';
    acc[health] = (acc[health] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  
  const dateRanges = bookmarks.reduce((acc, bookmark) => {
    const createdAt = new Date(bookmark.created_at);
    if (createdAt >= lastWeek) acc.last_week++;
    else if (createdAt >= lastMonth) acc.last_month++;
    else if (createdAt >= lastYear) acc.last_year++;
    else acc.older++;
    return acc;
  }, { last_week: 0, last_month: 0, last_year: 0, older: 0 });
  
  return {
    categories: Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    tags: Object.entries(tags)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50), // Limit to top 50 tags
    site_health: Object.entries(siteHealth)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    date_ranges: dateRanges
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'dev-user-123';
    
    // Parse search filters
    const filters: SearchFilters = {
      query: searchParams.get('q') || undefined,
      categories: searchParams.get('categories')?.split(',').filter(Boolean) || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      site_health: searchParams.get('site_health')?.split(',').filter(Boolean) || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      has_notes: searchParams.get('has_notes') ? searchParams.get('has_notes') === 'true' : undefined,
      has_ai_summary: searchParams.get('has_ai_summary') ? searchParams.get('has_ai_summary') === 'true' : undefined,
      min_visits: searchParams.get('min_visits') ? parseInt(searchParams.get('min_visits')!) : undefined,
      max_visits: searchParams.get('max_visits') ? parseInt(searchParams.get('max_visits')!) : undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'relevance',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };
    
    console.log(`🔍 Advanced search for user: ${userId}`, filters);
    
    // Load all bookmarks and filter by user
    const allBookmarks = await loadBookmarks();
    const userBookmarks = allBookmarks.filter(bookmark => bookmark.user_id === userId);
    
    // Apply filters
    const filteredBookmarks = applyFilters(userBookmarks, filters);
    
    // Sort results
    const sortedBookmarks = sortBookmarks(filteredBookmarks, filters.sort_by!, filters.sort_order!, filters.query);
    
    // Apply pagination
    const paginatedBookmarks = sortedBookmarks.slice(filters.offset!, filters.offset! + filters.limit!);
    
    // Transform bookmarks to match frontend format
    const transformedBookmarks = paginatedBookmarks.map(bookmark => ({
      id: bookmark.id,
      title: bookmark.title?.toUpperCase() || 'UNTITLED',
      url: bookmark.url,
      description: bookmark.description || 'No description available',
      category: bookmark.category || 'General',
      tags: bookmark.tags || [],
      priority: 'medium',
      isFavorite: false,
      visits: bookmark.visits || 0,
      lastVisited: bookmark.visits > 0 ? new Date(bookmark.created_at).toLocaleDateString() : 'Never',
      dateAdded: new Date(bookmark.created_at).toLocaleDateString(),
      favicon: bookmark.title?.charAt(0)?.toUpperCase() || 'B',
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "",
      notes: bookmark.notes || 'No notes',
      timeSpent: bookmark.time_spent ? `${bookmark.time_spent}m` : '0m',
      weeklyVisits: 0,
      siteHealth: bookmark.site_health || 'unknown',
      site_health: bookmark.site_health || 'unknown',
      healthCheckCount: bookmark.healthCheckCount || 0,
      last_health_check: bookmark.last_health_check,
      customBackground: bookmark.customBackground,
      project: {
        name: bookmark.ai_category || "GENERAL",
        progress: 0,
        status: "Active"
      },
      relatedBookmarks: bookmark.relatedBookmarks || [],
      ai_summary: bookmark.ai_summary,
      ai_tags: bookmark.ai_tags,
      ai_category: bookmark.ai_category,
      relevance_score: filters.query ? calculateRelevanceScore(bookmark, filters.query) : undefined
    }));
    
    // Generate facets for filtering UI
    const facets = generateFacets(filteredBookmarks);
    
    const result: SearchResult = {
      success: true,
      bookmarks: transformedBookmarks,
      total: userBookmarks.length,
      filtered: filteredBookmarks.length,
      page: Math.floor(filters.offset! / filters.limit!) + 1,
      per_page: filters.limit!,
      total_pages: Math.ceil(filteredBookmarks.length / filters.limit!),
      filters_applied: filters,
      search_time_ms: Date.now() - startTime,
      facets
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: (error as Error).message,
        search_time_ms: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { user_id, filters } = body;
    const userId = user_id || 'dev-user-123';
    
    console.log(`🔍 Advanced search (POST) for user: ${userId}`, filters);
    
    // Load all bookmarks and filter by user
    const allBookmarks = await loadBookmarks();
    const userBookmarks = allBookmarks.filter(bookmark => bookmark.user_id === userId);
    
    // Apply filters
    const filteredBookmarks = applyFilters(userBookmarks, filters);
    
    // Sort results
    const sortBy = filters.sort_by || 'relevance';
    const sortOrder = filters.sort_order || 'desc';
    const sortedBookmarks = sortBookmarks(filteredBookmarks, sortBy, sortOrder, filters.query);
    
    // Apply pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    const paginatedBookmarks = sortedBookmarks.slice(offset, offset + limit);
    
    // Transform bookmarks to match frontend format (same as GET)
    const transformedBookmarks = paginatedBookmarks.map(bookmark => ({
      id: bookmark.id,
      title: bookmark.title?.toUpperCase() || 'UNTITLED',
      url: bookmark.url,
      description: bookmark.description || 'No description available',
      category: bookmark.category || 'General',
      tags: bookmark.tags || [],
      priority: 'medium',
      isFavorite: false,
      visits: bookmark.visits || 0,
      lastVisited: bookmark.visits > 0 ? new Date(bookmark.created_at).toLocaleDateString() : 'Never',
      dateAdded: new Date(bookmark.created_at).toLocaleDateString(),
      favicon: bookmark.title?.charAt(0)?.toUpperCase() || 'B',
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "",
      notes: bookmark.notes || 'No notes',
      timeSpent: bookmark.time_spent ? `${bookmark.time_spent}m` : '0m',
      weeklyVisits: 0,
      siteHealth: bookmark.site_health || 'unknown',
      site_health: bookmark.site_health || 'unknown',
      healthCheckCount: bookmark.healthCheckCount || 0,
      last_health_check: bookmark.last_health_check,
      customBackground: bookmark.customBackground,
      project: {
        name: bookmark.ai_category || "GENERAL",
        progress: 0,
        status: "Active"
      },
      relatedBookmarks: bookmark.relatedBookmarks || [],
      ai_summary: bookmark.ai_summary,
      ai_tags: bookmark.ai_tags,
      ai_category: bookmark.ai_category,
      relevance_score: filters.query ? calculateRelevanceScore(bookmark, filters.query) : undefined
    }));
    
    // Generate facets for filtering UI
    const facets = generateFacets(filteredBookmarks);
    
    const result: SearchResult = {
      success: true,
      bookmarks: transformedBookmarks,
      total: userBookmarks.length,
      filtered: filteredBookmarks.length,
      page: Math.floor(offset / limit) + 1,
      per_page: limit,
      total_pages: Math.ceil(filteredBookmarks.length / limit),
      filters_applied: filters,
      search_time_ms: Date.now() - startTime,
      facets
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: (error as Error).message,
        search_time_ms: Date.now() - startTime
      },
      { status: 500 }
    );
  }
} 