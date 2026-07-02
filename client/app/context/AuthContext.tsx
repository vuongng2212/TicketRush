'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initialization to avoid setState in useEffect
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('ticketrush_token');
  });
  
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedUser = localStorage.getItem('ticketrush_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        // Clear corrupt storage
        localStorage.removeItem('ticketrush_token');
        localStorage.removeItem('ticketrush_user');
        return null;
      }
    }
    return null;
  });
  
  const [loading] = useState(false); // Always false with lazy initialization

  const refreshMe = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: 'query { me { id email roles } }',
        }),
      });
      
      const result = await response.json();
      if (result.data?.me) {
        const updatedUser = result.data.me;
        localStorage.setItem('ticketrush_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('ticketrush_token', newToken);
    localStorage.setItem('ticketrush_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('ticketrush_token');
    localStorage.removeItem('ticketrush_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
