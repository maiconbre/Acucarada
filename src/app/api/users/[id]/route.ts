import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession, updateUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const updateUserSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres').max(50).optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  is_active: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Obter usuário específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    // Superadmin pode ver qualquer usuário, admin só pode ver a si mesmo
    if (session.user.role !== 'superadmin' && session.user.id !== id) {
      return NextResponse.json(
        { success: false, error: { message: 'Acesso negado', code: 'UNAUTHORIZED' } },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role, is_active, last_login, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: { message: 'Usuário não encontrado', code: 'UNAUTHORIZED' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'UNAUTHORIZED' } },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    // Verificar permissões
    const isSuperAdmin = session.user.role === 'superadmin';
    const isOwnProfile = session.user.id === id;

    if (!isSuperAdmin && !isOwnProfile) {
      return NextResponse.json(
        { success: false, error: { message: 'Acesso negado', code: 'UNAUTHORIZED' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = updateUserSchema.safeParse(body);
    
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

    // Admin não pode alterar is_active (apenas superadmin)
    if (!isSuperAdmin && userData.is_active !== undefined) {
      return NextResponse.json(
        { success: false, error: { message: 'Acesso negado para alterar status', code: 'UNAUTHORIZED' } },
        { status: 403 }
      );
    }

    // Verificar se o usuário existe
    const supabase = await createClient();
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('id', id)
      .single();

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: { message: 'Usuário não encontrado', code: 'UNAUTHORIZED' } },
        { status: 404 }
      );
    }

    // Superadmin não pode desativar a si mesmo
    if (isSuperAdmin && isOwnProfile && userData.is_active === false) {
      return NextResponse.json(
        { success: false, error: { message: 'Superadmin não pode desativar a si mesmo', code: 'UNAUTHORIZED' } },
        { status: 400 }
      );
    }

    const result = await updateUser(id, userData, session.user.username, request);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'UNAUTHORIZED' } },
      { status: 500 }
    );
  }
}

// DELETE - Desativar usuário (apenas superadmin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: { message: 'Acesso negado', code: 'UNAUTHORIZED' } },
        { status: 403 }
      );
    }

    // Superadmin não pode deletar a si mesmo
    if (session.user.id === id) {
      return NextResponse.json(
        { success: false, error: { message: 'Superadmin não pode desativar a si mesmo', code: 'UNAUTHORIZED' } },
        { status: 400 }
      );
    }

    const result = await updateUser(id, { is_active: false }, session.user.username, request);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário desativado com sucesso',
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'UNAUTHORIZED' } },
      { status: 500 }
    );
  }
}