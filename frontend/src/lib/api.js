import { createClient } from './supabase/client';

export class ApiError extends Error {
  constructor(status, code, message, details = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiGet(path) {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
  const url = path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (res.status === 401) {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError(401, 'UNAUTHORIZED', 'Session expired. Please log in again.');
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errObj = json.error || {};
    throw new ApiError(
      res.status,
      errObj.code || 'UNKNOWN_ERROR',
      errObj.message || 'An error occurred',
      errObj.details || {}
    );
  }

  return json.data;
}
