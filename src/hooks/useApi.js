import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api-client';

/**
 * Generic data fetching hook.
 * @param {string} endpoint - API endpoint (e.g. '/harvesters')
 * @param {Array} deps - Dependency array for re-fetching
 */
export function useApi(endpoint, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await api.get(endpoint);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
