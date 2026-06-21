import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  role: 'Buyer' | 'Contractor' | 'Supplier' | 'Individual' | 'Business' | 'Professional' | 'Admin';
  createdAt?: string;
  gstNumber?: string;
  serviceCategory?: string;
  experience?: string;
  city?: string;
  state?: string;
  website?: string;
  portfolioUrl?: string;
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
    role: 'Buyer' | 'Contractor' | 'Supplier' | 'Individual' | 'Business' | 'Professional' | 'Admin';
    gstNumber?: string;
    serviceCategory?: string;
    experience?: string;
    city?: string;
    state?: string;
    website?: string;
    portfolioUrl?: string;
  }) => Promise<{ success: boolean; error?: string; email?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check token on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('arcus_token');
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            // Token expired or invalid
            localStorage.removeItem('arcus_token');
            setUser(null);
          }
        } catch (err) {
          console.error('Failed to restore auth session:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      if (data.error === 'email_not_verified') {
        return { success: false, error: 'email_not_verified', email: data.email };
      }
      localStorage.setItem('arcus_token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      return { success: true, email: data.email };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('arcus_token');
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    }
  };

  const logout = () => {
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
