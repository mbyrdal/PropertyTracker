import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react'
import type { User } from '../types/authTypes';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;  // Changed to no parameters
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

// In your AuthProvider
const login = () => {
  // Just set authenticated to true
  // The token is already stored by your auth service
  setIsAuthenticated(true);
};

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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