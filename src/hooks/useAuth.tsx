"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth'; 
import { Role, UserProfile } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage for mock session first to maintain the user's specific request
    const savedSession = localStorage.getItem('auth_session');
    if (savedSession) {
      try {
        const { email, expiry } = JSON.parse(savedSession);
        if (Date.now() < expiry) {
          const mockUser = { email, uid: 'admin-123', displayName: 'Administrador' };
          setUser(mockUser);
          setProfile({
            uid: 'admin-123',
            email,
            role: Role.ADMIN,
            name: 'Administrador'
          });
          setLoading(false);
          return;
        } else {
          localStorage.removeItem('auth_session');
        }
      } catch (e) {
        localStorage.removeItem('auth_session');
      }
    }

    // Default loading false if no session
    setLoading(false);
  }, []);

  const login = async (emailInput: string, passwordInput: string) => {
    // Specific credentials requested by user
    if (emailInput === "alex.b19h@gmail.com" && passwordInput === "060224Jc!") {
      const mockUser = {
        uid: 'admin-123',
        email: emailInput,
        displayName: 'Administrador'
      };
      
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

    // Try to fetch from 'users' collection in Firestore (simple mock auth since we can't create real Firebase Auth users here easily without Admin SDK)
    try {
      const userDoc = await getDoc(doc(db, 'users', emailInput.replace(/\./g, '_')));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.password === passwordInput) {
          const foundUser = {
            uid: userDoc.id,
            email: emailInput,
            displayName: userData.name
          };
          setUser(foundUser);
          setProfile({
            uid: userDoc.id,
            email: emailInput,
            role: userData.role as Role,
            name: userData.name
          });
          localStorage.setItem('auth_session', JSON.stringify({ 
            email: emailInput, 
            expiry: Date.now() + 86400000 // 24h
          }));
          return true;
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
    }

    return false;
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('auth_session');
    router.push('/login');
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
