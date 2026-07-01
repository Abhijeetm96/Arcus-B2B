import React, { createContext, useContext, useState, useEffect } from 'react';

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

// Helper to decode JWT payload safely without external dependencies
const decodeJwt = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const mapHttpStatusToError = (status: number, defaultMessage: string): string => {
  switch (status) {
    case 401:
      return 'Invalid email or password.';
    case 403:
      return 'Access denied.';
    case 404:
      return 'Authentication endpoint not found.';
    case 422:
      return 'Validation failed.';
    case 500:
      return 'Internal server error.';
    default:
      return defaultMessage;
  }
};

const getRedirectTarget = (userObj: User | null): string => {
  if (!userObj) return '#/';
  const role = (userObj.role || '').toUpperCase();
  if (role === 'ADMIN') return '#/portal/admin';
  const customerType = (userObj.customerType || '').toUpperCase();
  if (customerType === 'BUSINESS') return '#/dashboard/business';
  if (customerType === 'PROFESSIONAL') return '#/dashboard/professional';
  return '#/dashboard/individual';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check token on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('arcus_token');
      if (token) {
        if (isDev) {
          console.log('[AUTH CLIENT] Startup: Found local token, restoring session.');
        }
        try {
          const res = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            let data: any = {};
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              data = await res.json();
            }
            const normalized = normalizeUser(data);
            setUser(normalized);
            if (isDev) {
              console.log('[AUTH CLIENT] Startup: Session restored successfully.', normalized);
            }
          } else {
            if (isDev) {
              console.warn(`[AUTH CLIENT] Startup: Session restore failed with status ${res.status}. Cleared token.`);
            }
            // Token expired or invalid
            localStorage.removeItem('arcus_token');
            setUser(null);
          }
        } catch (err) {
          console.error('[AUTH CLIENT] Failed to restore auth session:', err);
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

  const login = async (email: string, password: string) => {
    if (isDev) {
      console.log('[AUTH CLIENT] Outgoing request: POST http://localhost:5000/api/auth/login', {
        email,
        password: '[REDACTED]'
      });
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (isDev) {
        console.log(`[AUTH CLIENT] Response received: Status ${res.status}`, data);
      }

      if (!res.ok) {
        const errorMsg = mapHttpStatusToError(res.status, data.error || 'Login failed');
        return { success: false, error: errorMsg };
      }

      if (data.error === 'email_not_verified') {
        return { success: false, error: 'email_not_verified', email: data.email };
      }

      localStorage.setItem('arcus_token', data.token);
      const normalized = normalizeUser(data.user);
      setUser(normalized);

      if (isDev) {
        const decoded = decodeJwt(data.token);
        console.log('[AUTH CLIENT] JWT received:', data.token);
        console.log('[AUTH CLIENT] Decoded JWT:', decoded);
        console.log('[AUTH CLIENT] Authenticated user:', normalized);
        console.log('[AUTH CLIENT] Redirect target:', getRedirectTarget(normalized));
      }

      return { success: true };
    } catch (err) {
      if (isDev) {
        console.error('[AUTH CLIENT] Connection error during login:', err);
      }
      return { success: false, error: 'Unable to connect to authentication server.' };
    }
  };

  const register = async (userData: any) => {
    const loggableData = { ...userData };
    if (loggableData.password) {
      loggableData.password = '[REDACTED]';
    }

    if (isDev) {
      console.log('[AUTH CLIENT] Outgoing request: POST http://localhost:5000/api/auth/register', loggableData);
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (isDev) {
        console.log(`[AUTH CLIENT] Response received: Status ${res.status}`, data);
      }

      if (!res.ok) {
        const errorMsg = mapHttpStatusToError(res.status, data.error || 'Registration failed');
        return { success: false, error: errorMsg };
      }

      if (data.token) {
        localStorage.setItem('arcus_token', data.token);
        const normalized = normalizeUser(data.user);
        setUser(normalized);

        if (isDev) {
          const decoded = decodeJwt(data.token);
          console.log('[AUTH CLIENT] JWT received:', data.token);
          console.log('[AUTH CLIENT] Decoded JWT:', decoded);
          console.log('[AUTH CLIENT] Authenticated user:', normalized);
          console.log('[AUTH CLIENT] Redirect target:', getRedirectTarget(normalized));
        }
      }

      return { success: true, email: data.email, token: data.token, user: normalizeUser(data.user) || undefined };
    } catch (err) {
      if (isDev) {
        console.error('[AUTH CLIENT] Connection error during registration:', err);
      }
      return { success: false, error: 'Unable to connect to authentication server.' };
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('arcus_token');
    if (token) {
      if (isDev) {
        console.log('[AUTH CLIENT] Refreshing user session.');
      }
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          let data: any = {};
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await res.json();
          }
          const normalized = normalizeUser(data);
          setUser(normalized);
          if (isDev) {
            console.log('[AUTH CLIENT] Session refreshed successfully.', normalized);
          }
        }
      } catch (err) {
        console.error('[AUTH CLIENT] Failed to refresh user:', err);
      }
    }
  };

  const logout = () => {
    if (isDev) {
      console.log('[AUTH CLIENT] Logging out user, clearing local session.');
    }
    localStorage.removeItem('arcus_token');
    setUser(null);
  };

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
