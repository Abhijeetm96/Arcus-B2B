import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  role: 'USER' | 'Admin' | string;
  createdAt?: string;
  gstNumber?: string;
  serviceCategory?: string;
  experience?: string;
  city?: string;
  state?: string;
  website?: string;
  portfolioUrl?: string;
  buildPoints?: number;
  customerType?: 'INDIVIDUAL' | 'BUSINESS' | 'PROFESSIONAL' | string;
  adminRole?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; email?: string }>;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    companyName?: string;
    role: string;
    gstNumber?: string;
    serviceCategory?: string;
    experience?: string;
    city?: string;
    state?: string;
    website?: string;
    portfolioUrl?: string;
  }) => Promise<{ success: boolean; error?: string; email?: string; token?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to normalize user role and customerType on client side
const normalizeUser = (u: any): User | null => {
  if (!u) return null;
  
  const rawRole = (u.role || '').toUpperCase();
  const normalizedRole = (rawRole === 'ADMIN' || rawRole === 'SUPER_ADMIN') ? 'Admin' : 'USER';
  
  let customerType = u.customerType || '';
  if (!customerType) {
    if (['INDIVIDUAL', 'BUYER', 'USER'].includes(rawRole)) {
      customerType = 'INDIVIDUAL';
    } else if (['BUSINESS', 'CONTRACTOR', 'SUPPLIER'].includes(rawRole)) {
      customerType = 'BUSINESS';
    } else if (['PROFESSIONAL'].includes(rawRole)) {
      customerType = 'PROFESSIONAL';
    } else {
      customerType = 'INDIVIDUAL';
    }
  } else {
    customerType = customerType.toUpperCase();
  }

  return {
    ...u,
    role: normalizedRole,
    customerType,
  };
};

const isDev = import.meta.env.DEV;

// Unused helpers removed to prevent TS6133 errors

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check token and backend health on startup
  useEffect(() => {
    const initAuth = async () => {
      if (isDev) {
        try {
          const health = await apiClient('/health', { skipAuth: true, timeout: 3000 });
          console.log('[AUTH CLIENT] Backend server health check succeeded:', health);
        } catch (err: any) {
          console.warn('[AUTH CLIENT] ⚠️ WARNING: Backend API server is offline or unreachable!', err.message);
        }
      }

      const token = localStorage.getItem('arcus_token');
      if (token) {
        if (isDev) {
          console.log('[AUTH CLIENT] Startup: Found local token, restoring session.');
        }
        try {
          const data = await apiClient('/auth/me', { timeout: 5000 });
          const normalized = normalizeUser(data);
          setUser(normalized);
          localStorage.setItem('arcus_cached_user', JSON.stringify(normalized));
          if (isDev) {
            console.log('[AUTH CLIENT] Startup: Session restored successfully.', normalized);
          }
        } catch (err: any) {
          if (err.status === 401 || err.status === 403) {
            if (isDev) {
              console.warn('[AUTH CLIENT] Startup: Token invalid or expired. Clearing session.', err.message);
            }
            localStorage.removeItem('arcus_token');
            localStorage.removeItem('arcus_cached_user');
            setUser(null);
          } else {
            // Transient error: attempt to load from local cache to stay logged in during downtime
            const cached = localStorage.getItem('arcus_cached_user');
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                setUser(parsed);
                console.log('[AUTH CLIENT] Startup: Server unreachable. Restored session from cache.', parsed);
              } catch {
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
        }
      } else {
        if (isDev) {
          console.log('[AUTH CLIENT] Startup: No local token found.');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Listen for reconnection to re-verify session in the background
  useEffect(() => {
    const handleReconnect = async () => {
      const token = localStorage.getItem('arcus_token');
      if (token) {
        try {
          const data = await apiClient('/auth/me', { timeout: 5000, retries: 0 });
          const normalized = normalizeUser(data);
          setUser(normalized);
          localStorage.setItem('arcus_cached_user', JSON.stringify(normalized));
          console.log('[AUTH CLIENT] Reconnect: Verified session in background.');
        } catch (err: any) {
          if (err.status === 401 || err.status === 403) {
            localStorage.removeItem('arcus_token');
            localStorage.removeItem('arcus_cached_user');
            setUser(null);
          }
        }
      }
    };
    window.addEventListener('arcus-reconnected', handleReconnect);
    return () => window.removeEventListener('arcus-reconnected', handleReconnect);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (isDev) {
      console.log('[AUTH CLIENT] Outgoing request: POST /auth/login', {
        email,
        password: '[REDACTED]'
      });
    }

    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true
      });

      if (data.error === 'email_not_verified') {
        return { success: false, error: 'email_not_verified', email: data.email };
      }

      localStorage.setItem('arcus_token', data.token);
      const normalized = normalizeUser(data.user);
      setUser(normalized);
      localStorage.setItem('arcus_cached_user', JSON.stringify(normalized));

      return { success: true };
    } catch (err: any) {
      if (isDev) {
        console.error('[AUTH CLIENT] Error during login:', err);
      }
      return { success: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    const loggableData = { ...userData };
    if (loggableData.password) {
      loggableData.password = '[REDACTED]';
    }

    if (isDev) {
      console.log('[AUTH CLIENT] Outgoing request: POST /auth/register', loggableData);
    }

    try {
      const data = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        skipAuth: true
      });

      if (data.token) {
        localStorage.setItem('arcus_token', data.token);
        const normalized = normalizeUser(data.user);
        setUser(normalized);
        localStorage.setItem('arcus_cached_user', JSON.stringify(normalized));
      }

      return { success: true, email: data.email, token: data.token, user: normalizeUser(data.user) || undefined };
    } catch (err: any) {
      if (isDev) {
        console.error('[AUTH CLIENT] Error during registration:', err);
      }
      return { success: false, error: err.message };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('arcus_token');
    if (token) {
      if (isDev) {
        console.log('[AUTH CLIENT] Refreshing user session.');
      }
      try {
        const data = await apiClient('/auth/me');
        const normalized = normalizeUser(data);
        setUser(normalized);
        localStorage.setItem('arcus_cached_user', JSON.stringify(normalized));
        if (isDev) {
          console.log('[AUTH CLIENT] Session refreshed successfully.', normalized);
        }
      } catch (err: any) {
        console.error('[AUTH CLIENT] Failed to refresh user:', err.message);
      }
    }
  }, []);

  const logout = useCallback(() => {
    if (isDev) {
      console.log('[AUTH CLIENT] Logging out user, clearing local session.');
    }
    localStorage.removeItem('arcus_token');
    localStorage.removeItem('arcus_cached_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
