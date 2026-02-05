import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, User } from '@/types';
import { USE_MOCK } from '@/config/mock';

const AuthContext = createContext<AuthContextType | undefined>(undefined);


const mockUser: User = {
  _id: 'mock-user',
  mobile: '9999999999',
  role: 'Distributor', // change to Distributor to test
  name: 'Apoorva Mock',
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(
    USE_MOCK ? mockUser : null
  );
  const [token, setToken] = useState<string | null>(
    USE_MOCK ? 'mock-token' : null
  );
  const [loading, setLoading] = useState(!USE_MOCK);

useEffect(() => {
  if (USE_MOCK) return;

  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (savedToken && savedUser) {
    setToken(savedToken);
    setUser(JSON.parse(savedUser));
  }

  setLoading(false);
}, []);



  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        loading,
      }}
    >
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
