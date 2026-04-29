"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth'; // Using type only for compatibility
import { Role, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (emailInput: string, passwordInput: string) => {
    // Specific credentials requested by user
    if (emailInput === "alex.b19h@gmail.com" && passwordInput === "060224Jc!") {
      const mockUser = {
        uid: 'admin-123',
        email: emailInput,
        displayName: 'Administrador'
      } as any;
      
      setUser(mockUser);
      setProfile({
        uid: 'admin-123',
        email: emailInput,
        role: Role.ADMIN,
        name: 'Administrador'
      });
      localStorage.setItem('auth_session', JSON.stringify({ 
        email: emailInput, 
        expiry: Date.now() + 86400000 // 24h
      }));
      return true;
    }
    return false;
  };

  useEffect(() => {
    const savedSession = localStorage.getItem('auth_session');
    if (savedSession) {
      try {
        const { email, expiry } = JSON.parse(savedSession);
        if (Date.now() < expiry) {
          setUser({ email, uid: 'admin-123', displayName: 'Administrador' } as any);
          setProfile({
            uid: 'admin-123',
            email,
            role: Role.ADMIN,
            name: 'Administrador'
          });
        } else {
          localStorage.removeItem('auth_session');
        }
      } catch (e) {
        localStorage.removeItem('auth_session');
      }
    }
    setLoading(false);
  }, []);

  const logout = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('auth_session');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
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
