import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdminFirestore } from '@/lib/firebase/server';
import { updateTrendingScores, updateRecentTrendingScores, getTrendingStats } from '@/lib/trending-jobs';

/**
 * API Route to update trending scores
 * 
 * This endpoint should be called periodically by a cron job
 * 
 * Query parameters:
 * - mode: 'all' (default) or 'recent' - which documents to update
 * - secret: API secret for authentication (set in environment variables)
 * 
 * Usage:
 * - Full update: GET /api/trending/update?mode=all&secret=YOUR_SECRET
 * - Recent only: GET /api/trending/update?mode=recent&secret=YOUR_SECRET
 * - Get stats: GET /api/trending/update?mode=stats&secret=YOUR_SECRET
 * 
 * Setup cron job in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/trending/update?mode=recent&secret=YOUR_SECRET",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('mode') || 'all';
  const secret = searchParams.get('secret');

  // Simple authentication - check if secret matches
  const expectedSecret = process.env.CRON_SECRET || process.env.TRENDING_UPDATE_SECRET;
  
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Cron secret not configured' },
      { status: 500 }
    );
  }

  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const startTime = Date.now();
    const db = firebaseAdminFirestore;

    if (mode === 'stats') {
      const stats = await getTrendingStats(db);
      return NextResponse.json({
        success: true,
        mode: 'stats',
        stats,
        duration: Date.now() - startTime,
      });
    }

    let result;
    
    if (mode === 'recent') {
      // Update only documents modified in last 24 hours
      result = await updateRecentTrendingScores(db, 24);
    } else {
      // Update all public documents
      result = await updateTrendingScores(db, 500);
    }

    return NextResponse.json({
      success: true,
      mode,
      ...result,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Error updating trending scores:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
