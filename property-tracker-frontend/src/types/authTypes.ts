export interface User {
  id: number;
  email: string;
  username?: string;  // Make optional if not always present
  role: string;
  createdAt?: string; // Make optional if not needed in frontend
}

export interface RegisterCredentials {
    email: string;
    username: string;
    password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  role: string;
  username?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}