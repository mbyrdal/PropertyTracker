import type { User } from '../types/authTypes';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7188/api';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  role: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        username: credentials.username,
        password: credentials.password
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error('Registration failed. Please try again.');
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    if (!data.accessToken) {
      throw new Error('Invalid response from server');
    }

    // Store auth data
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify({
      id: data.userId,
      email: data.email,
      role: data.role
    }));

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(`${API_URL}/Auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { accessToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    return { accessToken };
  } catch (error) {
    console.error('Token refresh error:', error);
    logout();
    throw error;
  }
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('accessToken') !== null;
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const logout = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};