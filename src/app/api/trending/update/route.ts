import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdminFirestore } from '@/lib/firebase/server';
import { updateTrendingScores, updateRecentTrendingScores, getTrendingStats } from '@/lib/trending-jobs';

/**
 * API Route to update trending scores
 * 
 * This endpoint is secured and called periodically by Vercel Cron
 * 
 * Security:
 * - Requires CRON_SECRET environment variable to be set in Vercel
 * - Vercel automatically sends the secret as Authorization: Bearer <CRON_SECRET>
 * 
 * Query parameters:
 * - mode: 'all' | 'recent' | 'stats' (default: 'all')
 * 
 * Usage:
 * - Full update: GET /api/trending/update?mode=all
 * - Recent only: GET /api/trending/update?mode=recent
 * - Get stats: GET /api/trending/update?mode=stats
 * 
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/trending/update?mode=recent",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 * 
 * Environment Variables (in Vercel Dashboard):
 * - CRON_SECRET: Random string (min 16 characters)
 */
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('mode') || 'all';

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
