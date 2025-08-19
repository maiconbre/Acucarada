export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: 'superadmin' | 'admin';
  is_active: boolean;
  last_login: string | null;
  login_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessLog {
  id: string;
  user_id: string | null;
  username: string;
  action: 'login' | 'logout' | 'login_failed' | 'password_change' | 'user_created' | 'user_updated';
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  details: string | null;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: {
    id: string;
    username: string;
    role: 'superadmin' | 'admin';
    is_active: boolean;
    last_login: string | null;
  };
  expires: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'superadmin' | 'admin';
  iat: number;
  exp: number;
}

export interface CreateUserData {
  username: string;
  password: string;
  role: 'admin'; // Apenas admin pode ser criado pelo superadmin
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  is_active?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthError {
  message: string;
  code: 'INVALID_CREDENTIALS' | 'USER_LOCKED' | 'USER_INACTIVE' | 'TOO_MANY_ATTEMPTS' | 'UNAUTHORIZED' | 'USER_EXISTS' | 'INVALID_TOKEN';
}

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

// Constantes de configuração
export const AUTH_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos em ms
  JWT_EXPIRES_IN: '24h',
  COOKIE_NAME: 'auth-token',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas em ms
    path: '/',
  },
} as const;