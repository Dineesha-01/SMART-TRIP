/**
 * SmartTrip — Robust API Client with Automatic Retry & Health Monitoring
 * Ensures high reliability for communication between React Frontend and Spring Boot Backend.
 */

const BASE_URL = 'http://localhost:8080/api/v1';

export async function requestWithRetry(endpoint, options = {}, retries = 2, delay = 500) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(localStorage.getItem('smarttrip_jwt') ? { 'Authorization': `Bearer ${localStorage.getItem('smarttrip_jwt')}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, config);
      if (response.ok) {
        return await response.json();
      }
      
      // If client error 4xx (except 408/429), don't retry, return parsed error
      if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorBody.message || `HTTP ${response.status} Error`);
      }
    } catch (err) {
      if (attempt === retries) {
        console.warn(`[SmartTrip API Client] Final attempt failed for ${url}:`, err.message);
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/admin/stats`, { method: 'GET', timeout: 3000 }).catch(() => null);
    return res && res.ok;
  } catch {
    return false;
  }
}
