import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await logout(request);

    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
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