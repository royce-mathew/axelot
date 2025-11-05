/**
 * Background Job for Computing Trending Scores
 * 
 * This file contains utilities for batch-updating trending scores in Firestore.
 * These should ideally run as a Cloud Function on a schedule (every 15-60 minutes)
 * or can be triggered manually for testing.
 * 
 * DEPLOYMENT OPTIONS:
 * 1. Firebase Cloud Functions (Recommended for production)
 *    - Schedule with Cloud Scheduler
 *    - Run every 15-30 minutes during peak hours
 *    - Run every 1-2 hours during off-peak
 * 
 * 2. Vercel Cron Jobs
 *    - Use Vercel's cron feature with API routes
 *    - Similar scheduling as above
 * 
 * 3. Manual trigger via API endpoint (for testing)
 */

import { collection, getDocs, writeBatch, doc, query, where, Timestamp } from 'firebase/firestore';
import { calculateTrendingScore, shouldRecomputeTrendingScore } from './trending-algorithm';
import { Document } from '@/types/document';

/**
 * Batch update trending scores for all public documents
 * This should be run periodically (every 15-60 minutes)
 * 
 * @param db - Firestore database instance (from firebase/firestore)
 * @param batchSize - Number of documents to update per batch (max 500)
 * @returns Number of documents updated
 */
export async function updateTrendingScores(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  batchSize: number = 500
): Promise<{ updated: number; skipped: number; errors: number }> {
  try {
    // Query for public documents that need score updates
    const storiesRef = collection(db, 'stories');
    const publicStoriesQuery = query(
      storiesRef,
      where('isPublic', '==', true),
      where('isArchived', '==', false)
    );

    const snapshot = await getDocs(publicStoriesQuery);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const docSnapshot of snapshot.docs) {
      const docData = docSnapshot.data() as Document;
      const docWithId = { ...docData, id: docSnapshot.id };

      // Check if we need to recompute
      if (!shouldRecomputeTrendingScore(docWithId)) {
        skipped++;
        continue;
      }

      try {
        // Calculate new trending score
        const newScore = calculateTrendingScore(docWithId);
        
        // Add to batch
        const docRef = doc(db, 'stories', docSnapshot.id);
        batch.update(docRef, {
          trendingScore: newScore,
          trendingLastComputed: Timestamp.now(),
        });

        batchCount++;
        updated++;

        // Commit batch if we've reached the limit
        if (batchCount >= batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      } catch (error) {
        console.error(`Error updating trending score for ${docSnapshot.id}:`, error);
        errors++;
      }
    }

    // Commit remaining documents
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`Trending scores updated: ${updated} updated, ${skipped} skipped, ${errors} errors`);
    
    return { updated, skipped, errors };
  } catch (error) {
    console.error('Error in updateTrendingScores:', error);
    throw error;
  }
}

/**
 * Update trending scores for recently active documents only
 * More efficient version that only updates documents modified in the last 24 hours
 */
export async function updateRecentTrendingScores(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  hoursBack: number = 24
): Promise<{ updated: number; skipped: number; errors: number }> {
  try {
    const cutoffTime = Timestamp.fromMillis(Date.now() - hoursBack * 3600000);
    
    const storiesRef = collection(db, 'stories');
    const recentStoriesQuery = query(
      storiesRef,
      where('isPublic', '==', true),
      where('isArchived', '==', false),
      where('lastUpdated', '>=', cutoffTime)
    );

    const snapshot = await getDocs(recentStoriesQuery);
    
    let updated = 0;
    const skipped = 0;
    let errors = 0;
    const batch = writeBatch(db);

    for (const docSnapshot of snapshot.docs) {
      const docData = docSnapshot.data() as Document;
      const docWithId = { ...docData, id: docSnapshot.id };

      try {
        // Calculate new trending score
        const newScore = calculateTrendingScore(docWithId);
        
        // Add to batch
        const docRef = doc(db, 'stories', docSnapshot.id);
        batch.update(docRef, {
          trendingScore: newScore,
          trendingLastComputed: Timestamp.now(),
        });

        updated++;
      } catch (error) {
        console.error(`Error updating trending score for ${docSnapshot.id}:`, error);
        errors++;
      }
    }

    // Commit all updates
    if (updated > 0) {
      await batch.commit();
    }

    console.log(`Recent trending scores updated: ${updated} updated, ${skipped} skipped, ${errors} errors`);
    
    return { updated, skipped, errors };
  } catch (error) {
    console.error('Error in updateRecentTrendingScores:', error);
    throw error;
  }
}

/**
 * Get statistics about trending scores
 * Useful for monitoring and debugging
 */
export async function getTrendingStats(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any
): Promise<{
  total: number;
  withScores: number;
  needingUpdate: number;
  recentlyUpdated: number;
}> {
  try {
    const storiesRef = collection(db, 'stories');
    const publicStoriesQuery = query(
      storiesRef,
      where('isPublic', '==', true),
      where('isArchived', '==', false)
    );

    const snapshot = await getDocs(publicStoriesQuery);
    
    let withScores = 0;
    let needingUpdate = 0;
    let recentlyUpdated = 0;
    const oneHourAgo = Date.now() - 3600000;

    for (const docSnapshot of snapshot.docs) {
      const docData = docSnapshot.data() as Document;
      const docWithId = { ...docData, id: docSnapshot.id };

      if (docData.trendingScore !== undefined) {
        withScores++;
      }

      if (shouldRecomputeTrendingScore(docWithId)) {
        needingUpdate++;
      }

      const lastComputed = docData.trendingLastComputed instanceof Timestamp
        ? docData.trendingLastComputed.toMillis()
        : 0;
      
      if (lastComputed > oneHourAgo) {
        recentlyUpdated++;
      }
    }

    return {
      total: snapshot.docs.length,
      withScores,
      needingUpdate,
      recentlyUpdated,
    };
  } catch (error) {
    console.error('Error getting trending stats:', error);
    throw error;
  }
}
