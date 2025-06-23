import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, RegisterCredentials, AuthResponse } from '../types/authTypes';
import { login as authLogin, register as authRegister, logout as authLogout, getCurrentUser, verifyToken, refreshToken } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (credentials: RegisterCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get fresh values from localStorage
        let storedToken = localStorage.getItem('accessToken');
        const storedUser = getCurrentUser();
        const storedRefreshToken = localStorage.getItem('refreshToken');

        // TEMPORARY FIX: Clear old tokens that might be incompatible
        if (storedToken) {
          try {
            // Try to decode the token to check if it has multiple audiences
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            
            // If the token doesn't have an array of audiences, it's old - clear it
            if (!Array.isArray(payload.aud)) {
              console.log('Clearing old token format');
              logout();
              return;
            }
          } catch (error) {
            console.log('Invalid token format, clearing');
            logout();
            return;
          }
        }

        // If no stored token or user, don't attempt authentication
        if (!storedUser || !storedToken) {
          logout();
          return;
        }

        // First, try to verify the current token
        const isValid = await verifyToken(storedToken);

        if (isValid) {
          // Token is valid, restore user session
          setUser({
            id: storedUser.id,
            email: storedUser.email,
            role: storedUser.role,
            username: storedUser.username,
            createdAt: storedUser.createdAt
          });
          setIsAuthenticated(true);
          setToken(storedToken);
        } else if (storedRefreshToken) {
          // Token is invalid, try to refresh if we have a refresh token
          try {
            console.log('Access token invalid, attempting refresh...');
            const refreshResponse = await refreshToken();
            
            // Update tokens and user state
            setToken(refreshResponse.accessToken);
            setIsAuthenticated(true);
            
            // Restore user from stored data (since refresh usually doesn't return user info)
            setUser({
              id: storedUser.id,
              email: storedUser.email,
              role: storedUser.role,
              username: storedUser.username,
              createdAt: storedUser.createdAt
            });
            
            console.log('Token refreshed successfully');
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Refresh failed, clear everything and force login
            logout();
          }
        } else {
          // No refresh token available, clear session
          console.log('No refresh token available, clearing session');
          logout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Any error during initialization should clear the session
        logout();
      }
    };

    initializeAuth();
  }, []); // Empty dependency array to run only once

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authLogin(email, password);

      const userData: User = {
        id: response.userId,
        email: response.email,
        role: response.role,
        username: response.username,
        createdAt: response.createdAt
      };

      setUser(userData);
      setIsAuthenticated(true);
      setToken(response.accessToken);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response: AuthResponse = await authRegister(credentials);

      const userData: User = {
        id: response.userId,
        email: response.email,
        role: response.role,
        username: response.username,
        createdAt: response.createdAt
      };

      setUser(userData);
      setIsAuthenticated(true);
      setToken(response.accessToken);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);

    // Clear localStorage (redundant with authLogout but ensures consistency)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, token, login, logout, register }}>
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