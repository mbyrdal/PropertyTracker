// utils/apiClient.ts
import { refreshToken } from '../services/auth';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5000/api';

class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  private async getValidToken(): Promise<string | null> {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    // If we're already refreshing, wait for it to complete
    if (this.isRefreshing && this.refreshPromise) {
      try {
        return await this.refreshPromise;
      } catch {
        return null;
      }
    }

    return token;
  }

  private async handleTokenRefresh(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const response = await refreshToken();
      return response.accessToken;
    } catch (error) {
      // Refresh failed, redirect to login
      localStorage.clear();
      window.location.href = '/login';
      throw error;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    let token = await this.getValidToken();

    const makeRequest = async (authToken: string | null): Promise<Response> => {
      // Create headers as a Record<string, string> to ensure proper typing
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Merge existing headers if they exist
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            headers[key] = value;
          });
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => {
            headers[key] = value;
          });
        } else {
          Object.assign(headers, options.headers);
        }
      }

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      return fetch(url, {
        ...options,
        headers,
      });
    };

    // First attempt
    let response = await makeRequest(token);

    // If unauthorized and we have a token, try to refresh
    if (response.status === 401 && token) {
      try {
        const newToken = await this.handleTokenRefresh();
        response = await makeRequest(newToken);
      } catch (refreshError) {
        // Refresh failed, throw the original 401 error
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Convenience methods
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();