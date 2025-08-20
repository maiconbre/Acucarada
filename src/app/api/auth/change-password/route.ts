import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession, changePassword } from '@/lib/auth';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = changePasswordSchema.safeParse(body);
    
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

    const { currentPassword, newPassword } = validationResult.data;

    const result = await changePassword(
      session.user.id,
      { currentPassword, newPassword },
      request
    );

    if (!result.success) {
      const statusCode = result.error?.code === 'INVALID_CREDENTIALS' ? 400 : 500;
      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso',
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'UNAUTHORIZED' } },
      { status: 500 }
    );
  }
}