import { Timestamp } from 'firebase/firestore';
import { Document } from '@/types/document';

/**
 * Calculates a trending score for a document based on multiple factors:
 * - Recency: How recently the document was updated (exponential decay)
 * - Views: Number of views (logarithmic scaling to prevent domination by viral content)
 * - Activity: Recent activity boost
 * 
 * The score uses a time-decay function similar to Reddit's "hot" algorithm
 * but adapted for document collaboration platforms.
 * 
 * Formula: score = log10(views + 1) * 4 + (age_in_hours / 12)^1.5
 * - Newer content gets higher scores
 * - View count has diminishing returns (log scale)
 * - Balances freshness with popularity
 */
export function calculateTrendingScore(doc: Document): number {
  const now = Date.now();
  const created = doc.created instanceof Timestamp ? doc.created.toMillis() : now;
  const lastUpdated = doc.lastUpdated instanceof Timestamp ? doc.lastUpdated.toMillis() : now;
  
  // Time factors (in milliseconds)
  const hourInMs = 3600000;
  
  // Calculate age in hours since creation
  const ageInHours = (now - created) / hourInMs;
  
  // Calculate recency boost (more recent updates get higher scores)
  // Documents updated in the last 24 hours get a significant boost
  const timeSinceUpdate = (now - lastUpdated) / hourInMs;
  const recencyBoost = Math.max(0, 1 - (timeSinceUpdate / 24)); // 1.0 for just updated, 0 after 24 hours
  
  // View count with logarithmic scaling
  const viewCount = doc.viewCount || 0;
  const viewScore = Math.log10(Math.max(1, viewCount)) * 4;
  
  // Age penalty (older content gradually loses score)
  // Using power function for exponential decay
  const agePenalty = Math.pow(ageInHours / 12, 1.5);
  
  // Final score calculation
  // Higher score = more trending
  const score = viewScore + (recencyBoost * 10) - (agePenalty * 0.1);
  
  return Math.max(0, score); // Ensure non-negative
}

/**
 * Client-side sorting function for trending stories
 * Use this when you already have the documents and want to sort them
 */
export function sortByTrending(docs: Document[]): Document[] {
  return [...docs].sort((a, b) => {
    const scoreA = a.trendingScore ?? calculateTrendingScore(a);
    const scoreB = b.trendingScore ?? calculateTrendingScore(b);
    return scoreB - scoreA; // Descending order
  });
}

/**
 * Determines if a document's trending score needs to be recomputed
 * Scores should be recomputed every 1-6 hours depending on activity
 */
export function shouldRecomputeTrendingScore(doc: Document): boolean {
  if (!doc.trendingLastComputed) return true;
  
  const now = Date.now();
  const lastComputed = doc.trendingLastComputed instanceof Timestamp 
    ? doc.trendingLastComputed.toMillis() 
    : 0;
  
  const hoursSinceComputed = (now - lastComputed) / 3600000;
  
  // Recompute if:
  // - Never computed before
  // - More than 1 hour has passed
  // - Document was recently updated (within last hour) - compute every 15 minutes
  const lastUpdated = doc.lastUpdated instanceof Timestamp 
    ? doc.lastUpdated.toMillis() 
    : 0;
  const hoursSinceUpdate = (now - lastUpdated) / 3600000;
  
  if (hoursSinceUpdate < 1) {
    return hoursSinceComputed > 0.25; // 15 minutes for recently active docs
  }
  
  return hoursSinceComputed > 1; // 1 hour for others
}

/**
 * Batch compute trending scores for multiple documents
 * Useful for background jobs or cloud functions
 */
export function batchComputeTrendingScores(docs: Document[]): Map<string, number> {
  const scores = new Map<string, number>();
  
  for (const doc of docs) {
    if (doc.id && shouldRecomputeTrendingScore(doc)) {
      scores.set(doc.id, calculateTrendingScore(doc));
    }
  }
  
  return scores;
}

/**
 * Get time-based boost factor for very recent activity
 * Used to give extra visibility to just-published or just-updated content
 */
export function getActivityBoost(doc: Document): number {
  const now = Date.now();
  const lastUpdated = doc.lastUpdated instanceof Timestamp 
    ? doc.lastUpdated.toMillis() 
    : now;
  
  const minutesSinceUpdate = (now - lastUpdated) / 60000;
  
  // Boost factor decreases exponentially
  // 100% boost in first hour, 50% in next hour, then tapers off
  if (minutesSinceUpdate < 60) return 2.0; // 200% of base score
  if (minutesSinceUpdate < 120) return 1.5; // 150% of base score
  if (minutesSinceUpdate < 360) return 1.2; // 120% of base score
  
  return 1.0; // Normal score after 6 hours
}
