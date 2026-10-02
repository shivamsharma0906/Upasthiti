import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, UserRecord } from '@/server/server/src/types';

// Align with types.ts
export type UserRole = Role;

// Ensure User interface matches UserRecord without passwordHash
export interface User extends Omit<UserRecord, 'passwordHash'> {}

export const isStudentProfileComplete = (user: User | null | undefined): boolean => {
  if (!user || user.role !== 'student') return true;
  return Boolean(
    user.rollNumber?.trim() &&
    user.department?.trim() &&
    user.program?.trim() &&
    user.year?.trim() &&
    user.semester?.trim() &&
    user.section?.trim() &&
    user.academicSession?.trim()
  );
};

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string, 
    email: string, 
    password: string, 
    role: Role, 
    extra?: { personalEmail?: string; phone?: string; avatar?: string }
  ) => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<UpdateProfileResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ems_user');
    const token = localStorage.getItem('ems_token');
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('ems_user');
        localStorage.removeItem('ems_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password })
      });
      if (!res.ok) {
        return false;
      }
      const data = await res.json();
      const { token, user: loggedIn } = data as { token: string; user: User };
      localStorage.setItem('ems_token', token);
      localStorage.setItem('ems_user', JSON.stringify(loggedIn));
      setUser(loggedIn);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    role: Role,
    extra?: { personalEmail?: string; phone?: string; avatar?: string }
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.toLowerCase().trim(), 
          password, 
          role, 
          ...extra 
        })
      });
      if (!res.ok) {
        return false;
      }
      const data = await res.json();
      const { token, user: registered } = data as { token: string; user: User };
      localStorage.setItem('ems_token', token);
      localStorage.setItem('ems_user', JSON.stringify(registered));
      setUser(registered);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<UpdateProfileResult> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ems_token');
      if (!token) {
        logout();
        return { success: false, error: 'Session expired. Please log in again.' };
      }

      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          return { success: false, error: 'Session expired. Please sign in again.' };
        }
        return { 
          success: false, 
          error: data?.error || `Failed to update profile (status: ${res.status})` 
        };
      }

      const updatedUser = data.user as User;
      localStorage.setItem('ems_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error: any) {
      console.error('Update profile network error:', error);
      return { 
        success: false, 
        error: error?.message || 'Network error communicating with the authentication service.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ems_user');
    localStorage.removeItem('ems_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, updateProfile, logout, isLoading }}>
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