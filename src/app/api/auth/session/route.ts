import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Não autenticado', 
            code: 'UNAUTHORIZED' 
          } 
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: session.user,
        expires: session.expires,
      },
    });

  } catch (error) {
    console.error('Session check error:', error);
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