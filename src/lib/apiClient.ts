/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ✅ For development: use localhost:3000, for production: use deployed URL
const API_BASE = (import.meta as any).env?.VITE_API_URL || 
  (import.meta.env?.DEV ? 'http://localhost:3000' : 'https://dental-clinic-backend-0vjn.onrender.com');

export const API_BASE_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE.replace(/\/$/, '')}/api`;

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
  
  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export { API_BASE };