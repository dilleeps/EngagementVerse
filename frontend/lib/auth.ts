import type { UserRole } from '@engagement-verse/shared';

// ─── Cookie helpers ──────────────────────────────────────────────────────────

function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ─── Token management ────────────────────────────────────────────────────────

const ACCESS_TOKEN_KEY = 'ev_access_token';
const REFRESH_TOKEN_KEY = 'ev_refresh_token';

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  setCookie(ACCESS_TOKEN_KEY, access, 1); // 1 day for access
  setCookie(REFRESH_TOKEN_KEY, refresh, 30); // 30 days for refresh
}

export function clearTokens(): void {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
}

// ─── JWT decode ──────────────────────────────────────────────────────────────

interface JWTPayload {
  sub: string;
  email?: string;
  'cognito:groups'?: string[];
  'cognito:username'?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

export function extractRole(token: string): UserRole | null {
  const payload = decodeToken(token);
  if (!payload) return null;
  const groups = payload['cognito:groups'];
  if (!groups || groups.length === 0) return null;
  // Map Cognito group to UserRole
  const roleMap: Record<string, UserRole> = {
    MSL_LEAD: 'MSL_LEAD',
    COMMERCIAL_OPS: 'COMMERCIAL_OPS',
    MEDICAL_AFFAIRS: 'MEDICAL_AFFAIRS',
    BRAND_MARKETING: 'BRAND_MARKETING',
    KOL_MANAGEMENT: 'KOL_MANAGEMENT',
  };
  for (const group of groups) {
    const role = roleMap[group.toUpperCase()];
    if (role) return role;
  }
  return null;
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return false;
  // Check if token is expired
  return payload.exp * 1000 > Date.now();
}
