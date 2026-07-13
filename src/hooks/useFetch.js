import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../lib/constants';
import { storage } from '../lib/storage';

/**
 * Simple fetch hook for public endpoints (no auth).
 * @param {string} path - Full API path
 * @param {Array} deps - Dependency array
 */
export function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!path) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const url = `${API_BASE_URL}${path}`;
        const headers = {};
        const token = storage.getToken();
        if (token && path.includes('/admin')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error('Fetch failed');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
