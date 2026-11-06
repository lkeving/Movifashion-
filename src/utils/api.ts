// Client API Helper with Dual-Auth Support (Cookie + Bearer Token)

export const TOKEN_STORAGE_KEY = 'movi_token';
export const SESSION_ID_KEY = 'movi_session_id';

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (err) {
    console.warn('[AUTH] Error saving token to sessionStorage:', err);
  }
}

export function clearStoredToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (err) {
    console.warn('[AUTH] Error removing token from sessionStorage:', err);
  }
}

export function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return `sess_${Date.now()}`;
  }
}

/**
 * Enhanced fetch wrapper that:
 * 1. Always includes credentials: 'include' (for HttpOnly cookies across origins/iframes)
 * 2. Injects Authorization: Bearer <token> if token exists in sessionStorage
 * 3. Injects X-Session-Id for analytics tracking
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const sessionId = getSessionId();

  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('X-Session-Id')) {
    headers.set('X-Session-Id', sessionId);
  }

  const mergedOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers,
  };

  return fetch(url, mergedOptions);
}
