import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for server-side access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('📖 Fetching bookmarks from database...');
    
    // Get user_id from query params (for now we'll use the test user)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '48e1b5b9-3b0f-4ccb-8b34-831b1337fc3f';
    
    // Fetch bookmarks from database
    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks', details: error.message },
        { status: 500 }
      );
    }
    
    console.log(`✅ Successfully fetched ${bookmarks?.length || 0} bookmarks`);
    
    // Transform database bookmarks to match frontend format
    const transformedBookmarks = bookmarks?.map((bookmark, index) => ({
      id: index + 1, // Use sequential IDs for frontend
      title: bookmark.title?.toUpperCase() || 'UNTITLED',
      url: bookmark.url,
      description: bookmark.description || 'No description available',
      category: bookmark.category || 'General',
      tags: [], // Tags can be added later
      priority: 'medium', // Default priority
      isFavorite: false, // Default favorite status
      visits: Math.floor(Math.random() * 50) + 1, // Random visits for now
      lastVisited: new Date(bookmark.created_at).toLocaleDateString(),
      dateAdded: new Date(bookmark.created_at).toLocaleDateString(),
      favicon: bookmark.title?.charAt(0)?.toUpperCase() || 'B',
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "", // Background logo can be added later
      notes: 'Imported from bulk uploader',
      timeSpent: '0m',
      weeklyVisits: Math.floor(Math.random() * 20) + 1,
      siteHealth: 'good',
      project: {
        name: "IMPORTED",
        progress: Math.floor(Math.random() * 100),
        status: "Active"
      }
    })) || [];
    
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
    const { title, url, description, category, user_id } = body;
    
    // Validate required fields
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }
    
    const userId = user_id || '00000000-0000-0000-0000-000000000000';
    
    // Insert new bookmark
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{
        user_id: userId,
        title,
        url,
        description: description || '',
        category: category || 'General',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to create bookmark:', error);
      return NextResponse.json(
        { error: 'Failed to create bookmark', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Successfully created bookmark:', data);
    
    return NextResponse.json({
      success: true,
      bookmark: data
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 