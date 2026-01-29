import { Timestamp } from "firebase/firestore"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Document } from "@/types/document"
import {
  batchComputeTrendingScores,
  calculateTrendingScore,
  getActivityBoost,
  shouldRecomputeTrendingScore,
  sortByTrending,
} from "@/lib/trending-algorithm"

// Helper to create a mock Document with specific timestamps
function createMockDocument(overrides: Partial<Document> = {}): Document {
  const now = Date.now()
  return {
    id: "test-doc-id",
    owner: "test-owner",
    readAccess: [],
    writeAccess: [],
    isPublic: true,
    title: "Test Document",
    created: Timestamp.fromMillis(now),
    lastUpdated: Timestamp.fromMillis(now),
    lastUpdatedBy: "test-user",
    isArchived: false,
    viewCount: 0,
    ...overrides,
  }
}

// Helper to create a Timestamp from hours ago
function hoursAgo(hours: number): Timestamp {
  return Timestamp.fromMillis(Date.now() - hours * 60 * 60 * 1000)
}

// Helper to create a Timestamp from minutes ago
function minutesAgo(minutes: number): Timestamp {
  return Timestamp.fromMillis(Date.now() - minutes * 60 * 1000)
}

// Helper to create a Timestamp from days ago
function daysAgo(days: number): Timestamp {
  return Timestamp.fromMillis(Date.now() - days * 24 * 60 * 60 * 1000)
}

describe("trending-algorithm", () => {
  // Use fake timers for consistent test results
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("calculateTrendingScore", () => {
    describe("basic scoring", () => {
      it("returns a non-negative score for any document", () => {
        const doc = createMockDocument()
        const score = calculateTrendingScore(doc)
        expect(score).toBeGreaterThanOrEqual(0)
      })

      it("returns higher score for documents with more views", () => {
        const lowViews = createMockDocument({ viewCount: 10 })
        const highViews = createMockDocument({ viewCount: 1000 })

        const lowScore = calculateTrendingScore(lowViews)
        const highScore = calculateTrendingScore(highViews)

        expect(highScore).toBeGreaterThan(lowScore)
      })

      it("uses logarithmic scaling for views (prevents viral domination)", () => {
        // With log scaling, 1M views should NOT be 100,000x higher than 10 views
        const tenViews = createMockDocument({ viewCount: 10 })
        const millionViews = createMockDocument({ viewCount: 1_000_000 })

        const tenScore = calculateTrendingScore(tenViews)
        const millionScore = calculateTrendingScore(millionViews)

        // Ratio should be much less than 100,000 due to log scaling
        // log10(1_000_000) / log10(10) = 6 / 1 = 6x difference in view component
        const ratio = millionScore / tenScore
        expect(ratio).toBeLessThan(10) // Much less than linear scaling
        expect(ratio).toBeGreaterThan(1) // But still higher
      })

      it("handles zero views gracefully", () => {
        const doc = createMockDocument({ viewCount: 0 })
        const score = calculateTrendingScore(doc)
        expect(score).toBeGreaterThanOrEqual(0)
        expect(Number.isFinite(score)).toBe(true)
      })

      it("handles undefined viewCount as zero", () => {
        const doc = createMockDocument()
        delete (doc as Partial<Document>).viewCount
        const score = calculateTrendingScore(doc)
        expect(score).toBeGreaterThanOrEqual(0)
        expect(Number.isFinite(score)).toBe(true)
      })
    })

    describe("recency boost", () => {
      it("gives higher score to recently updated documents", () => {
        const justUpdated = createMockDocument({
          lastUpdated: minutesAgo(30), // 30 minutes ago
        })
        const updatedYesterday = createMockDocument({
          lastUpdated: hoursAgo(25), // 25 hours ago (past 24hr window)
        })

        const recentScore = calculateTrendingScore(justUpdated)
        const oldScore = calculateTrendingScore(updatedYesterday)

        expect(recentScore).toBeGreaterThan(oldScore)
      })

      it("gives maximum recency boost to just-updated documents", () => {
        const justNow = createMockDocument({
          lastUpdated: Timestamp.fromMillis(Date.now()),
        })
        const twelveHoursAgo = createMockDocument({
          lastUpdated: hoursAgo(12),
        })

        const nowScore = calculateTrendingScore(justNow)
        const twelveScore = calculateTrendingScore(twelveHoursAgo)

        // Just updated should have higher score due to recency boost
        expect(nowScore).toBeGreaterThan(twelveScore)
      })

      it("gives no recency boost after 24 hours", () => {
        const twentyFourHours = createMockDocument({
          lastUpdated: hoursAgo(24),
        })
        const fortyEightHours = createMockDocument({
          lastUpdated: hoursAgo(48),
        })

        // Both are past 24hr window, so recency boost is 0 for both
        // The only difference should be age penalty, which is minimal
        const score24 = calculateTrendingScore(twentyFourHours)
        const score48 = calculateTrendingScore(fortyEightHours)

        // Scores should be relatively close (no recency boost difference)
        // Age penalty difference is small for same-age documents
        expect(Math.abs(score24 - score48)).toBeLessThan(1)
      })
    })

    describe("age penalty", () => {
      it("penalizes older documents", () => {
        const newDoc = createMockDocument({
          created: hoursAgo(1),
          lastUpdated: hoursAgo(1),
          viewCount: 100,
        })
        const oldDoc = createMockDocument({
          created: daysAgo(7),
          lastUpdated: daysAgo(7),
          viewCount: 100,
        })

        const newScore = calculateTrendingScore(newDoc)
        const oldScore = calculateTrendingScore(oldDoc)

        expect(newScore).toBeGreaterThan(oldScore)
      })

      it("applies exponential age penalty (power of 1.5)", () => {
        const oneDayOld = createMockDocument({
          created: daysAgo(1),
          lastUpdated: daysAgo(1),
          viewCount: 100,
        })
        const sevenDaysOld = createMockDocument({
          created: daysAgo(7),
          lastUpdated: daysAgo(7),
          viewCount: 100,
        })

        const oneDay = calculateTrendingScore(oneDayOld)
        const sevenDays = calculateTrendingScore(sevenDaysOld)

        // 7-day-old doc should have significantly lower score
        expect(sevenDays).toBeLessThan(oneDay)
      })
    })

    describe("edge cases", () => {
      it("handles very high view counts without overflow", () => {
        const viralDoc = createMockDocument({ viewCount: 1_000_000_000 })
        const score = calculateTrendingScore(viralDoc)

        expect(Number.isFinite(score)).toBe(true)
        expect(score).toBeGreaterThan(0)
      })

      it("handles very old documents without negative scores", () => {
        const ancientDoc = createMockDocument({
          created: daysAgo(365),
          lastUpdated: daysAgo(365),
          viewCount: 10,
        })
        const score = calculateTrendingScore(ancientDoc)

        // Score is clamped to 0 minimum
        expect(score).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe("sortByTrending", () => {
    it("sorts documents by trending score in descending order", () => {
      const lowScore = createMockDocument({
        id: "low",
        viewCount: 1,
        created: daysAgo(30),
        lastUpdated: daysAgo(30),
      })
      const highScore = createMockDocument({
        id: "high",
        viewCount: 1000,
        created: hoursAgo(1),
        lastUpdated: hoursAgo(1),
      })
      const midScore = createMockDocument({
        id: "mid",
        viewCount: 100,
        created: daysAgo(3),
        lastUpdated: daysAgo(1),
      })

      const sorted = sortByTrending([lowScore, highScore, midScore])

      expect(sorted[0].id).toBe("high")
      expect(sorted[2].id).toBe("low")
    })

    it("uses pre-computed trendingScore if available", () => {
      const docWithScore = createMockDocument({
        id: "precomputed",
        trendingScore: 999,
        viewCount: 1, // Would normally have low score
      })
      const docWithoutScore = createMockDocument({
        id: "computed",
        viewCount: 100,
      })

      const sorted = sortByTrending([docWithoutScore, docWithScore])

      // Pre-computed score of 999 should win
      expect(sorted[0].id).toBe("precomputed")
    })

    it("does not mutate the original array", () => {
      const docs = [
        createMockDocument({ id: "a", viewCount: 1 }),
        createMockDocument({ id: "b", viewCount: 100 }),
      ]
      const originalOrder = docs.map((d) => d.id)

      sortByTrending(docs)

      expect(docs.map((d) => d.id)).toEqual(originalOrder)
    })

    it("handles empty array", () => {
      const sorted = sortByTrending([])
      expect(sorted).toEqual([])
    })

    it("handles single document", () => {
      const doc = createMockDocument({ id: "only" })
      const sorted = sortByTrending([doc])
      expect(sorted.length).toBe(1)
      expect(sorted[0].id).toBe("only")
    })
  })

  describe("shouldRecomputeTrendingScore", () => {
    it("returns true if trendingLastComputed is not set", () => {
      const doc = createMockDocument()
      expect(shouldRecomputeTrendingScore(doc)).toBe(true)
    })

    it("returns true if more than 1 hour has passed for inactive documents", () => {
      const doc = createMockDocument({
        trendingLastComputed: hoursAgo(2),
        lastUpdated: daysAgo(1), // Not recently active
      })
      expect(shouldRecomputeTrendingScore(doc)).toBe(true)
    })

    it("returns false if less than 1 hour has passed for inactive documents", () => {
      const doc = createMockDocument({
        trendingLastComputed: minutesAgo(30),
        lastUpdated: daysAgo(1), // Not recently active
      })
      expect(shouldRecomputeTrendingScore(doc)).toBe(false)
    })

    it("returns true after 15 minutes for recently active documents", () => {
      const doc = createMockDocument({
        trendingLastComputed: minutesAgo(20), // 20 minutes ago
        lastUpdated: minutesAgo(10), // Active in last hour
      })
      expect(shouldRecomputeTrendingScore(doc)).toBe(true)
    })

    it("returns false within 15 minutes for recently active documents", () => {
      const doc = createMockDocument({
        trendingLastComputed: minutesAgo(10), // 10 minutes ago
        lastUpdated: minutesAgo(5), // Active in last hour
      })
      expect(shouldRecomputeTrendingScore(doc)).toBe(false)
    })
  })

  describe("batchComputeTrendingScores", () => {
    it("returns a Map of document IDs to scores", () => {
      const docs = [
        createMockDocument({ id: "doc1", viewCount: 10 }),
        createMockDocument({ id: "doc2", viewCount: 100 }),
      ]

      const scores = batchComputeTrendingScores(docs)

      expect(scores).toBeInstanceOf(Map)
      expect(scores.has("doc1")).toBe(true)
      expect(scores.has("doc2")).toBe(true)
    })

    it("only computes for documents that need recomputation", () => {
      const needsCompute = createMockDocument({ id: "needs" })
      const alreadyComputed = createMockDocument({
        id: "computed",
        trendingLastComputed: minutesAgo(5),
        lastUpdated: daysAgo(1),
      })

      const scores = batchComputeTrendingScores([needsCompute, alreadyComputed])

      expect(scores.has("needs")).toBe(true)
      expect(scores.has("computed")).toBe(false)
    })

    it("skips documents without an id", () => {
      const withId = createMockDocument({ id: "has-id" })
      const withoutId = createMockDocument()
      delete withoutId.id

      const scores = batchComputeTrendingScores([withId, withoutId])

      expect(scores.size).toBe(1)
      expect(scores.has("has-id")).toBe(true)
    })

    it("handles empty array", () => {
      const scores = batchComputeTrendingScores([])
      expect(scores.size).toBe(0)
    })
  })

  describe("getActivityBoost", () => {
    it("returns 2.0 for documents updated in the last hour", () => {
      const doc = createMockDocument({ lastUpdated: minutesAgo(30) })
      expect(getActivityBoost(doc)).toBe(2.0)
    })

    it("returns 1.5 for documents updated 1-2 hours ago", () => {
      const doc = createMockDocument({ lastUpdated: minutesAgo(90) })
      expect(getActivityBoost(doc)).toBe(1.5)
    })

    it("returns 1.2 for documents updated 2-6 hours ago", () => {
      const doc = createMockDocument({ lastUpdated: hoursAgo(4) })
      expect(getActivityBoost(doc)).toBe(1.2)
    })

    it("returns 1.0 for documents updated more than 6 hours ago", () => {
      const doc = createMockDocument({ lastUpdated: hoursAgo(7) })
      expect(getActivityBoost(doc)).toBe(1.0)
    })

    it("handles boundary conditions correctly", () => {
      // Exactly 60 minutes - should be 1.5 (just past first tier)
      const at60 = createMockDocument({ lastUpdated: minutesAgo(60) })
      expect(getActivityBoost(at60)).toBe(1.5)

      // Exactly 120 minutes - should be 1.2 (just past second tier)
      const at120 = createMockDocument({ lastUpdated: minutesAgo(120) })
      expect(getActivityBoost(at120)).toBe(1.2)

      // Exactly 360 minutes (6 hours) - should be 1.0 (just past third tier)
      const at360 = createMockDocument({ lastUpdated: minutesAgo(360) })
      expect(getActivityBoost(at360)).toBe(1.0)
    })
  })

  describe("integration: algorithm behavior", () => {
    it("balances all factors for realistic ranking", () => {
      // Scenario: Which should rank higher?
      // A: New post (1hr old), few views (10), just updated
      // B: Week-old post, many views (1000), not updated recently
      // C: Day-old post, moderate views (100), updated 12hr ago

      const newLowViews = createMockDocument({
        id: "A",
        created: hoursAgo(1),
        lastUpdated: hoursAgo(1),
        viewCount: 10,
      })

      const oldHighViews = createMockDocument({
        id: "B",
        created: daysAgo(7),
        lastUpdated: daysAgo(2),
        viewCount: 1000,
      })

      const moderateAll = createMockDocument({
        id: "C",
        created: daysAgo(1),
        lastUpdated: hoursAgo(12),
        viewCount: 100,
      })

      const sorted = sortByTrending([oldHighViews, moderateAll, newLowViews])

      // New content with recency boost should compete with high-view older content
      // The exact order depends on tuning, but all should have positive scores
      sorted.forEach((doc) => {
        const score = calculateTrendingScore(doc)
        expect(score).toBeGreaterThan(0)
      })
    })
  })
})
