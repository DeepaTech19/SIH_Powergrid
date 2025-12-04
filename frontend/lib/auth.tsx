// File: lib/auth.ts
// Replace existing firebase-based auth with backend-based auth (no UI changes).
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export type AppUser = {
  user_id: number | string;
  email?: string;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function fetchJson(url: string, opts: RequestInit = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    // try to parse json message
    try {
      const j = JSON.parse(text);
      throw new Error(j.detail || j.message || text || res.statusText);
    } catch {
      throw new Error(text || res.statusText);
    }
  }
  return res.json();
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // simple check to restore auth from localStorage
    const authFlag = localStorage.getItem('auth');
    if (authFlag === 'yes' && !user) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const payload = { email, password };
    const data = await fetchJson(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // backend expected to return { user_id: ..., email: ... }
    const u: AppUser = { user_id: data.user_id ?? data.id ?? data.userId, email: data.email ?? email };
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('auth', 'yes'); // keep your existing redirect checks working
    setUser(u);
  };

  const signUp = async (email: string, password: string) => {
    const payload = { email, password };
    // backend /auth/register should return { user_id: ... }
    const data = await fetchJson(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // do NOT auto login — keep UI flow simple: user registers then signs in
    // but we'll save the created user's id in localStorage as "registered_user" (optional)
    const created = { user_id: data.user_id ?? data.id ?? data.userId, email: data.email ?? email };
    localStorage.setItem('registered_user', JSON.stringify(created));
    // return so calling UI can show success message
  };

  const logout = async () => {
    // no server logout endpoint required for this simple flow
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
    localStorage.removeItem('registered_user');
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    // your backend may not have a reset endpoint. Try calling /auth/reset (optional)
    try {
      await fetchJson(`${BASE_URL}/auth/reset`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      // If no backend support, instruct developer through thrown error
      throw new Error(
        (err as Error).message ||
          'Password reset not supported by backend. Implement /auth/reset or use manual reset workflow.'
      );
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
