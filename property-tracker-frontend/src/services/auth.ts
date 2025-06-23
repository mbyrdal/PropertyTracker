import type { User } from '../types/authTypes';

const API_URL = import.meta.env.VITE_BASE_API_URL || 'https://localhost:5000/api';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  role: string;
  username?: string; // Add optional username
  createdAt?: string; // Add optional createdAt
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/Auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  
  if (!storedRefreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_URL}/Auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        refreshToken: storedRefreshToken 
      }),
    });

    if (!response.ok) {
      // Log the actual error response
      const errorText = await response.text();
      console.error('Refresh token API error:', response.status, errorText);
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data: RefreshTokenResponse = await response.json();
    
    if (!data.accessToken || !data.refreshToken) {
      throw new Error('Invalid refresh response: missing tokens');
    }

    // Update stored tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Don't call logout here - let the calling context handle it
    // This prevents circular dependencies and ensures proper state management
    throw error;
  }
};

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
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error instanceof Error ? error : new Error('Registration failed. Please try again.');
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
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    if (!data.accessToken || !data.refreshToken) {
      throw new Error('Invalid response from server: missing tokens');
    }

    // Store auth data
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify({
      id: data.userId,
      email: data.email,
      role: data.role,
      username: data.username,
      createdAt: data.createdAt
    }));

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error instanceof Error ? error : new Error('Login failed');
  }
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('accessToken') !== null;
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};