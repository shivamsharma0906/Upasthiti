import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, UserRecord } from '@/server/server/src/types';
import bcrypt from 'bcryptjs'; // For password hashing simulation

// Align with types.ts
export type UserRole = Role;

// Ensure User interface matches UserRecord without passwordHash
export interface User extends Omit<UserRecord, 'passwordHash'> {
  avatar?: string; // Optional if not in UserRecord, adjust based on types.ts
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users with hashed passwords (immutable array for demo)
const initialMockUsers: (UserRecord & { passwordHash: string })[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'student@edu.com',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'student',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'teacher@edu.com',
    passwordHash: bcrypt.hashSync('teacher123', 10),
    role: 'teacher',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'admin@edu.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

// Use state to manage mock users, avoiding direct mutation
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mockUsers, setMockUsers] = useState<(UserRecord & { passwordHash: string })[]>(initialMockUsers);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('ems_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('ems_user'); // Clear invalid data
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser && bcrypt.compareSync(password, foundUser.passwordHash)) {
        const { passwordHash, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('ems_user', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error.message || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: Role): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        console.warn('Signup failed: Email already registered');
        return false;
      }

      const newUser: UserRecord = {
        id: Date.now().toString(), // Simple ID generation for demo
        name,
        email: email.toLowerCase(),
        passwordHash: bcrypt.hashSync(password, 10),
        role,
        avatar: `https://i.pravatar.cc/150?img=${mockUsers.length + 1}`,
      };

      // Update mockUsers immutably
      setMockUsers(prevUsers => [...prevUsers, newUser]);
      const { passwordHash, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('ems_user', JSON.stringify(userWithoutPassword));
      return true;
    } catch (error) {
      console.error('Signup error:', error.message || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ems_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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