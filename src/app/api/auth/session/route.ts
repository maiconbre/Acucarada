import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG SESSION API ===');
     
     // Debug: verificar cookies
     const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-token');
    console.log('Auth cookie:', authCookie?.value ? 'EXISTS' : 'NOT_FOUND');
    
    const session = await getCurrentSession();
    console.log('Session result:', session ? 'VALID' : 'INVALID');

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