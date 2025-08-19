'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthSession, LoginCredentials, AuthResponse } from '@/types/auth';

interface UseAuthReturn {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();

      if (result.success) {
        setSession(result.data);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (result.success) {
        await refreshSession();
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          message: 'Erro de conexão. Tente novamente.',
          code: 'UNAUTHORIZED',
        },
      };
    } finally {
      setIsLoading(false);
    }
  }, [refreshSession]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setSession(null);
      setIsLoading(false);
      router.push('/admin/login');
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const isAuthenticated = !!session;
  const isSuperAdmin = session?.user.role === 'superadmin';

  return {
    session,
    isLoading,
    isAuthenticated,
    isSuperAdmin,
    login,
    logout,
    refreshSession,
  };
}