import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthUser {
  id: number;
  email: string;
  fullName?: string;
  roles?: string[];
}

interface AuthContextType {
  token?: string;
  user?: AuthUser;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  apiFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | undefined>(() => localStorage.getItem('sm_token') || undefined);
  const [user, setUser] = useState<AuthUser | undefined>(() => {
    const stored = localStorage.getItem('sm_user');
    return stored ? JSON.parse(stored) : undefined;
  });

  useEffect(() => {
    if (token) localStorage.setItem('sm_token', token);
    else localStorage.removeItem('sm_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('sm_user', JSON.stringify(user));
    else localStorage.removeItem('sm_user');
  }, [user]);

  const apiFetch = useMemo(
    () => async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setToken(undefined);
          setUser(undefined);
        }
        let message = await res.text();
        try {
          const parsed = JSON.parse(message);
          message = parsed.message || message;
        } catch {
          // ignore JSON parse failures
        }
        throw new Error(message || 'Request failed');
      }
      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    },
    [token]
  );

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    setToken(undefined);
    setUser(undefined);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
