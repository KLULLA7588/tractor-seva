import { storage } from './storage';
import { API_BASE_URL, API_TIMEOUT } from './constants';

/**
 * Core API client. Handles auth headers, 401 redirect, and error normalization.
 * @param {string} endpoint - API path starting with /
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Parsed response data
 */
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = storage.getToken();

  const headers = { ...options.headers };

  // Don't set Content-Type for FormData (browser sets boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && endpoint.includes('/admin')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      storage.removeToken();
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || data.error || 'API Error');
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
}

/**
 * Convenience methods for common HTTP verbs.
 */
export const api = {
  get: (endpoint) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    apiCall(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body) =>
    apiCall(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' }),
};
