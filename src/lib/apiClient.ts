/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ✅ Determine the API base URL with proper environment detection
const getApiBase = (): string => {
  // 1. Check for environment variable first (Vercel, Netlify, etc.)
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // 2. Check if we're in development mode
  if (import.meta.env?.DEV) {
    return 'http://localhost:3000';
  }

  // 3. Production fallback
  return 'https://dental-clinic-backend-0vjn.onrender.com';
};

const API_BASE = getApiBase();

// Ensure the URL doesn't have trailing slash and ends with /api
export const API_BASE_URL = API_BASE.endsWith('/api') 
  ? API_BASE 
  : `${API_BASE.replace(/\/$/, '')}/api`;

export function getAuthToken(): string | null {
  return localStorage.getItem('dental_portal_auth_token') || localStorage.getItem('token');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

export async function apiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {})
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  console.log(`🔗 API Call: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      // Handle 401/403 - auth errors
      if (response.status === 401 || response.status === 403) {
        // Clear invalid auth token
        localStorage.removeItem('dental_portal_auth_token');
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('unauthorized'));
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(`❌ API Error (${url}):`, error);
    throw error;
  }
}

export { API_BASE };