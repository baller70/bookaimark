import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface ExtensionAnalytics {
  bookmarksSaved: number;
  suggestionsShown: number;
  suggestionsAccepted: number;
  categoriesUsed: string[];
  lastSync: number;
  timestamp: number;
  userAgent?: string;
  version?: string;
}

interface AnalyticsData {
  daily: Record<string, ExtensionAnalytics>;
  weekly: Record<string, ExtensionAnalytics>;
  monthly: Record<string, ExtensionAnalytics>;
  total: ExtensionAnalytics;
  lastUpdated: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookmarksSaved,
      suggestionsShown,
      suggestionsAccepted,
      categoriesUsed,
      lastSync
    } = body;

    // Get current date for analytics grouping
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const thisWeek = getWeekKey(now);
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Load existing analytics
    const analyticsPath = path.join(process.cwd(), 'data', 'extension-analytics.json');
    let analytics: AnalyticsData;

    try {
      const analyticsData = await fs.readFile(analyticsPath, 'utf-8');
      analytics = JSON.parse(analyticsData);
    } catch (error) {
      // Initialize new analytics data
      analytics = {
        daily: {},
        weekly: {},
        monthly: {},
        total: {
          bookmarksSaved: 0,
          suggestionsShown: 0,
          suggestionsAccepted: 0,
          categoriesUsed: [],
          lastSync: 0,
          timestamp: Date.now()
        },
        lastUpdated: Date.now()
      };
    }

    // Update daily analytics
    if (!analytics.daily[today]) {
      analytics.daily[today] = {
        bookmarksSaved: 0,
        suggestionsShown: 0,
        suggestionsAccepted: 0,
        categoriesUsed: [],
        lastSync: 0,
        timestamp: Date.now()
      };
    }

    // Update weekly analytics
    if (!analytics.weekly[thisWeek]) {
      analytics.weekly[thisWeek] = {
        bookmarksSaved: 0,
        suggestionsShown: 0,
        suggestionsAccepted: 0,
        categoriesUsed: [],
        lastSync: 0,
        timestamp: Date.now()
      };
    }

    // Update monthly analytics
    if (!analytics.monthly[thisMonth]) {
      analytics.monthly[thisMonth] = {
        bookmarksSaved: 0,
        suggestionsShown: 0,
        suggestionsAccepted: 0,
        categoriesUsed: [],
        lastSync: 0,
        timestamp: Date.now()
      };
    }

    // Increment counters
    const increment = {
      bookmarksSaved: bookmarksSaved || 0,
      suggestionsShown: suggestionsShown || 0,
      suggestionsAccepted: suggestionsAccepted || 0
    };

    // Update all periods
    [analytics.daily[today], analytics.weekly[thisWeek], analytics.monthly[thisMonth], analytics.total].forEach(period => {
      period.bookmarksSaved += increment.bookmarksSaved;
      period.suggestionsShown += increment.suggestionsShown;
      period.suggestionsAccepted += increment.suggestionsAccepted;
      period.lastSync = lastSync || Date.now();
      period.timestamp = Date.now();

      // Update categories used
      if (categoriesUsed && Array.isArray(categoriesUsed)) {
        const existingCategories = new Set(period.categoriesUsed);
        categoriesUsed.forEach(category => existingCategories.add(category));
        period.categoriesUsed = Array.from(existingCategories);
      }
    });

    // Update last updated timestamp
    analytics.lastUpdated = Date.now();

    // Clean up old daily data (keep only last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    Object.keys(analytics.daily).forEach(date => {
      if (date < cutoffDate) {
        delete analytics.daily[date];
      }
    });

    // Clean up old weekly data (keep only last 12 weeks)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
    const cutoffWeek = getWeekKey(twelveWeeksAgo);

    Object.keys(analytics.weekly).forEach(week => {
      if (week < cutoffWeek) {
        delete analytics.weekly[week];
      }
    });

    // Clean up old monthly data (keep only last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const cutoffMonth = `${twelveMonthsAgo.getFullYear()}-${String(twelveMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

    Object.keys(analytics.monthly).forEach(month => {
      if (month < cutoffMonth) {
        delete analytics.monthly[month];
      }
    });

    // Save updated analytics
    await fs.writeFile(analyticsPath, JSON.stringify(analytics, null, 2));

    return NextResponse.json({
      success: true,
      analytics: {
        today: analytics.daily[today],
        thisWeek: analytics.weekly[thisWeek],
        thisMonth: analytics.monthly[thisMonth],
        total: analytics.total
      }
    });

  } catch (error) {
    console.error('Error updating extension analytics:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly, total
    const limit = parseInt(searchParams.get('limit') || '30');

    // Load analytics data
    const analyticsPath = path.join(process.cwd(), 'data', 'extension-analytics.json');
    
    let analytics: AnalyticsData;
    try {
      const analyticsData = await fs.readFile(analyticsPath, 'utf-8');
      analytics = JSON.parse(analyticsData);
    } catch (error) {
      return NextResponse.json({
        analytics: {},
        summary: {
          totalBookmarksSaved: 0,
          totalSuggestionsShown: 0,
          totalSuggestionsAccepted: 0,
          acceptanceRate: 0,
          topCategories: [],
          lastSync: null
        },
        period,
        limit
      });
    }

    let periodData: Record<string, ExtensionAnalytics> = {};
    
    switch (period) {
      case 'daily':
        periodData = analytics.daily;
        break;
      case 'weekly':
        periodData = analytics.weekly;
        break;
      case 'monthly':
        periodData = analytics.monthly;
        break;
      case 'total':
        periodData = { total: analytics.total };
        break;
    }

    // Sort by date and limit results
    const sortedData = Object.entries(periodData)
      .sort(([a], [b]) => b.localeCompare(a)) // Most recent first
      .slice(0, limit)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, ExtensionAnalytics>);

    // Calculate summary statistics
    const summary = calculateSummary(analytics);

    return NextResponse.json({
      analytics: sortedData,
      summary,
      period,
      limit,
      lastUpdated: analytics.lastUpdated
    });

  } catch (error) {
    console.error('Error fetching extension analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function getWeekKey(date: Date): string {
  // Get Monday of the week
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  monday.setDate(diff);
  
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD of Monday
}

function calculateSummary(analytics: AnalyticsData) {
  const total = analytics.total;
  
  // Calculate acceptance rate
  const acceptanceRate = total.suggestionsShown > 0 
    ? (total.suggestionsAccepted / total.suggestionsShown) * 100 
    : 0;

  // Get top categories
  const categoryCount: Record<string, number> = {};
  
  // Count categories across all periods
  Object.values(analytics.daily).forEach(day => {
    day.categoriesUsed.forEach(category => {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });

  const topCategories = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  // Calculate recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  let recentBookmarks = 0;
  let recentSuggestions = 0;
  
  Object.entries(analytics.daily).forEach(([date, data]) => {
    if (new Date(date) >= sevenDaysAgo) {
      recentBookmarks += data.bookmarksSaved;
      recentSuggestions += data.suggestionsShown;
    }
  });

  return {
    totalBookmarksSaved: total.bookmarksSaved,
    totalSuggestionsShown: total.suggestionsShown,
    totalSuggestionsAccepted: total.suggestionsAccepted,
    acceptanceRate: Math.round(acceptanceRate * 100) / 100,
    topCategories,
    recentActivity: {
      bookmarksLast7Days: recentBookmarks,
      suggestionsLast7Days: recentSuggestions
    },
    lastSync: total.lastSync
  };
} 