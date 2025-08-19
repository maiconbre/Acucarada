import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate, setAuthCookie } from '@/lib/auth';

const loginSchema = z.object({
  username: z.string().min(1, 'Username é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados de entrada
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Dados inválidos', 
            code: 'INVALID_CREDENTIALS' 
          } 
        },
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    // Autenticar usuário
    const authResult = await authenticate({ username, password }, request);

    if (!authResult.success) {
      const statusCode = authResult.error?.code === 'USER_LOCKED' ? 423 : 401;
      return NextResponse.json(authResult, { status: statusCode });
    }

    // Definir cookie de autenticação
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: authResult.data!.user.id,
          username: authResult.data!.user.username,
          role: authResult.data!.user.role,
          last_login: authResult.data!.user.last_login,
        },
      },
    });

    // Definir cookie diretamente na resposta
    response.cookies.set({
      name: 'auth-token',
      value: authResult.data!.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Erro interno do servidor', 
          code: 'UNAUTHORIZED' 
        } 
      },
      { status: 500 }
    );
  }
}