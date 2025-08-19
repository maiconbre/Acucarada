import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  User, 
  AuthSession, 
  JWTPayload, 
  LoginCredentials, 
  AuthResponse, 
  CreateUserData, 
  UpdateUserData,
  ChangePasswordData,
  AUTH_CONFIG 
} from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

// Utilitários de hash
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Utilitários JWT
export const generateToken = (user: User): string => {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };
  
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN,
  });
  
  return token;
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

// Gestão de cookies
export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_CONFIG.COOKIE_NAME, token, AUTH_CONFIG.COOKIE_OPTIONS);
};

export const removeAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_CONFIG.COOKIE_NAME);
};

export const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_CONFIG.COOKIE_NAME)?.value || null;
};

// Obter sessão atual
export const getCurrentSession = async (): Promise<AuthSession | null> => {
  const token = await getAuthToken();
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const supabase = await createClient();
  const { data: user } = await supabase
    .from('users')
    .select('id, username, role, is_active, last_login')
    .eq('id', payload.userId)
    .eq('is_active', true)
    .single();

  if (!user) return null;

  return {
    user,
    expires: new Date(payload.exp * 1000).toISOString(),
  };
};

// Verificar se usuário está logado
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};

// Verificar se usuário é superadmin
export const isSuperAdmin = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return session?.user.role === 'superadmin';
};

// Log de acesso
export const logAccess = async (
  username: string,
  action: string,
  success: boolean,
  request?: NextRequest,
  details?: string,
  userId?: string
) => {
  const supabase = await createClient();
  
  await supabase.from('access_logs').insert({
    user_id: userId || null,
    username,
    action,
    ip_address: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || null,
    user_agent: request?.headers.get('user-agent') || null,
    success,
    details: details || null,
  });
};

// Verificar tentativas de login
export const checkLoginAttempts = async (username: string): Promise<boolean> => {
  const supabase = await createClient();
  
  const { data: user } = await supabase
    .from('users')
    .select('login_attempts, locked_until')
    .eq('username', username)
    .single();

  if (!user) return true; // Usuário não existe, permitir tentativa

  // Verificar se está bloqueado
  if (user.locked_until) {
    const lockoutTime = new Date(user.locked_until);
    if (lockoutTime > new Date()) {
      return false; // Ainda bloqueado
    }
    
    // Desbloqueio automático
    await supabase
      .from('users')
      .update({ 
        login_attempts: 0, 
        locked_until: null 
      })
      .eq('username', username);
  }

  return user.login_attempts < AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;
};

// Incrementar tentativas de login
export const incrementLoginAttempts = async (username: string) => {
  const supabase = await createClient();
  
  const { data: user } = await supabase
    .from('users')
    .select('login_attempts')
    .eq('username', username)
    .single();

  if (!user) return;

  const newAttempts = user.login_attempts + 1;
  const shouldLock = newAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;

  await supabase
    .from('users')
    .update({
      login_attempts: newAttempts,
      locked_until: shouldLock 
        ? new Date(Date.now() + AUTH_CONFIG.LOCKOUT_DURATION).toISOString()
        : null,
    })
    .eq('username', username);
};

// Reset tentativas de login
export const resetLoginAttempts = async (username: string) => {
  const supabase = await createClient();
  
  await supabase
    .from('users')
    .update({ 
      login_attempts: 0, 
      locked_until: null,
      last_login: new Date().toISOString(),
    })
    .eq('username', username);
};

// Autenticação principal
export const authenticate = async (
  credentials: LoginCredentials,
  request?: NextRequest
): Promise<AuthResponse<{ user: User; token: string }>> => {
  const { username, password } = credentials;

  // Verificar tentativas de login
  const canAttempt = await checkLoginAttempts(username);
  
  if (!canAttempt) {
    await logAccess(username, 'login_failed', false, request, 'Account locked');
    return {
      success: false,
      error: {
        message: 'Conta bloqueada devido a muitas tentativas de login. Tente novamente em 15 minutos.',
        code: 'USER_LOCKED',
      },
    };
  }

  const supabase = await createClient();
  
  // Buscar usuário
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (!user) {
    await logAccess(username, 'login_failed', false, request, 'User not found');
    return {
      success: false,
      error: {
        message: 'Credenciais inválidas.',
        code: 'INVALID_CREDENTIALS',
      },
    };
  }

  // Verificar se usuário está ativo
  if (!user.is_active) {
    await logAccess(username, 'login_failed', false, request, 'User inactive', user.id);
    return {
      success: false,
      error: {
        message: 'Usuário inativo.',
        code: 'USER_INACTIVE',
      },
    };
  }

  // Verificar senha
  const isValidPassword = await verifyPassword(password, user.password_hash);
  
  if (!isValidPassword) {
    await incrementLoginAttempts(username);
    await logAccess(username, 'login_failed', false, request, 'Invalid password', user.id);
    return {
      success: false,
      error: {
        message: 'Credenciais inválidas.',
        code: 'INVALID_CREDENTIALS',
      },
    };
  }

  // Login bem-sucedido
  console.log('Login successful, generating token...');
  await resetLoginAttempts(username);
  const token = generateToken(user);
  console.log('Token generated:', token ? 'YES' : 'NO');
  
  await logAccess(username, 'login', true, request, 'Successful login', user.id);

  return {
    success: true,
    data: { user, token },
  };
};

// Logout
export const logout = async (request?: NextRequest): Promise<void> => {
  const session = await getCurrentSession();
  if (session) {
    await logAccess(
      session.user.username, 
      'logout', 
      true, 
      request, 
      'User logout', 
      session.user.id
    );
  }
  
  await removeAuthCookie();
};

// Criar usuário (apenas superadmin)
export const createUser = async (
  userData: CreateUserData,
  createdBy: string,
  request?: NextRequest
): Promise<AuthResponse<User>> => {
  const supabase = await createClient();

  // Verificar se usuário já existe
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', userData.username)
    .single();

  if (existingUser) {
    return {
      success: false,
      error: {
        message: 'Usuário já existe.',
        code: 'USER_EXISTS',
      },
    };
  }

  // Verificar limite de usuários (máximo 2)
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (count && count >= 2) {
    return {
      success: false,
      error: {
        message: 'Limite máximo de usuários atingido.',
        code: 'UNAUTHORIZED',
      },
    };
  }

  // Criar usuário
  const passwordHash = await hashPassword(userData.password);
  
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      username: userData.username,
      password_hash: passwordHash,
      role: userData.role,
      is_active: true,
      login_attempts: 0,
    })
    .select()
    .single();

  if (error || !newUser) {
    return {
      success: false,
      error: {
        message: 'Erro ao criar usuário.',
        code: 'UNAUTHORIZED',
      },
    };
  }

  await logAccess(
    createdBy,
    'user_created',
    true,
    request,
    `Created user: ${userData.username}`,
    newUser.id
  );

  return {
    success: true,
    data: newUser,
  };
};

// Atualizar usuário
export const updateUser = async (
  userId: string,
  userData: UpdateUserData,
  updatedBy: string,
  request?: NextRequest
): Promise<AuthResponse<User>> => {
  const supabase = await createClient();

  const updateData: any = { ...userData };
  
  // Hash da nova senha se fornecida
  if (userData.password) {
    updateData.password_hash = await hashPassword(userData.password);
    delete updateData.password;
  }

  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error || !updatedUser) {
    return {
      success: false,
      error: {
        message: 'Erro ao atualizar usuário.',
        code: 'UNAUTHORIZED',
      },
    };
  }

  await logAccess(
    updatedBy,
    'user_updated',
    true,
    request,
    `Updated user: ${updatedUser.username}`,
    userId
  );

  return {
    success: true,
    data: updatedUser,
  };
};

// Alterar senha
export const changePassword = async (
  userId: string,
  passwordData: ChangePasswordData,
  request?: NextRequest
): Promise<AuthResponse<void>> => {
  const supabase = await createClient();

  // Buscar usuário atual
  const { data: user } = await supabase
    .from('users')
    .select('username, password_hash')
    .eq('id', userId)
    .single();

  if (!user) {
    return {
      success: false,
      error: {
        message: 'Usuário não encontrado.',
        code: 'UNAUTHORIZED',
      },
    };
  }

  // Verificar senha atual
  const isValidPassword = await verifyPassword(passwordData.currentPassword, user.password_hash);
  if (!isValidPassword) {
    await logAccess(user.username, 'password_change', false, request, 'Invalid current password', userId);
    return {
      success: false,
      error: {
        message: 'Senha atual incorreta.',
        code: 'INVALID_CREDENTIALS',
      },
    };
  }

  // Atualizar senha
  const newPasswordHash = await hashPassword(passwordData.newPassword);
  
  const { error } = await supabase
    .from('users')
    .update({ password_hash: newPasswordHash })
    .eq('id', userId);

  if (error) {
    return {
      success: false,
      error: {
        message: 'Erro ao alterar senha.',
        code: 'UNAUTHORIZED',
      },
    };
  }

  await logAccess(user.username, 'password_change', true, request, 'Password changed successfully', userId);

  return {
    success: true,
  };
};