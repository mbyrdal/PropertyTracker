import type { AuthResponse, LoginCredentials, User } from '../types/authTypes';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7188/api/property';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const credentials: LoginCredentials = { email, password };
  
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data: AuthResponse = await response.json();
  
  if (!data.token || !data.user) {
    throw new Error('Invalid response from server');
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};