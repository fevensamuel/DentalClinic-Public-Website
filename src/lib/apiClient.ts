/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ✅ HARDCODED for Vercel deployment
const API_BASE = 'https://dental-clinic-backend-0vjn.onrender.com';

export const API_BASE_URL = `${API_BASE}/api`;

console.log('🔗 API_BASE_URL:', API_BASE_URL);

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
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('dental_portal_auth_token');
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('unauthorized'));
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(`❌ API Error (${url}):`, error);
    throw error;
  }
}

export { API_BASE };