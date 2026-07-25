import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api-client';

/**
 * Generic data fetching hook.
 * @param {string} endpoint - API endpoint (e.g. '/harvesters')
 * @param {Array} deps - Dependency array for re-fetching
 * @param {number|null} pollInterval - Optional. If set (ms), silently
 *   re-fetches in the background on that interval, without flipping
 *   `loading` back to true on every poll (only the first load shows it).
 *   Defaults to null (no polling) — existing callers are unaffected.
 */
export function useApi(endpoint, deps = [], pollInterval = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedOnce = useRef(false);

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      setLoading(false);
      return;
    }
    try {
      if (!hasLoadedOnce.current) {
        setLoading(true);
      }
      setError(null);
      const result = await api.get(endpoint);
      setData(result);
      hasLoadedOnce.current = true;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    hasLoadedOnce.current = false;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  useEffect(() => {
    if (!pollInterval) return;
    const id = setInterval(() => {
      fetchData();
    }, pollInterval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollInterval, fetchData]);

  return { data, loading, error, refetch: fetchData };
}