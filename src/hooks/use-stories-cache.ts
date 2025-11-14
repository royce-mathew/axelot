import { useState, useEffect, useRef, DependencyList } from "react"

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Custom hook that caches query results for a specified duration
 * Useful for reducing Firestore reads on navigation back/forward
 *
 * @param queryFn - Async function that fetches the data
 * @param deps - Dependency array (like useEffect)
 * @param cacheKey - Unique key for this cache entry
 * @param cacheDuration - How long to keep cached data (default: 5 minutes)
 * @returns Object with data, loading state, and manual refresh function
 */
export function useStoriesCache<T>(
  queryFn: () => Promise<T>,
  deps: DependencyList,
  cacheKey: string,
  cacheDuration: number = CACHE_DURATION
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use a ref for the cache to persist across re-renders
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())

  const fetchData = async (forceRefresh: boolean = false) => {
    const cache = cacheRef.current
    const cached = cache.get(cacheKey)

    // Return cached data if fresh and not forcing refresh
    if (
      !forceRefresh &&
      cached &&
      Date.now() - cached.timestamp < cacheDuration
    ) {
      setData(cached.data)
      setLoading(false)
      return
    }

    // Fetch fresh data
    setLoading(true)
    setError(null)

    try {
      const result = await queryFn()
      cache.set(cacheKey, { data: result, timestamp: Date.now() })
      setData(result)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err : new Error("Unknown error"))

      // Fall back to stale cache if available
      if (cached) {
        setData(cached.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // Manual refresh function
  const refresh = () => {
    fetchData(true)
  }

  return { data, loading, error, refresh }
}
