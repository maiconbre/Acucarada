import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession, createUser, isSuperAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const createUserSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres').max(50),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.literal('admin'),
});

// GET - Listar usuários (apenas superadmin)
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: { message: 'Acesso negado', code: 'UNAUTHORIZED' } },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, is_active, last_login, created_at, updated_at')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao buscar usuários', code: 'UNAUTHORIZED' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: users,
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'UNAUTHORIZED' } },
      { status: 500 }
    );
  }
}

// POST - Criar usuário (apenas superadmin)
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: { message: 'Acesso negado', code: 'UNAUTHORIZED' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = createUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: validationResult.error.issues[0]?.message || 'Dados inválidos', 
            code: 'INVALID_CREDENTIALS' 
          } 
        },
        { status: 400 }
      );
    }

    const userData = validationResult.data;
    const result = await createUser(userData, session.user.username, request);

    if (!result.success) {
      const statusCode = result.error?.code === 'USER_EXISTS' ? 409 : 400;
      return NextResponse.json(result, { status: statusCode });
    }

    // Remover senha hash da resposta
    const { password_hash, ...userWithoutPassword } = result.data!;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'UNAUTHORIZED' } },
      { status: 500 }
    );
  }
}