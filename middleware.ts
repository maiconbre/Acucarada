import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { AUTH_CONFIG } from '@/types/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se é uma rota protegida (admin)
  if (pathname.startsWith('/admin')) {
    // Permitir acesso à página de login
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Verificar token de autenticação
    const token = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;
    
    if (!token) {
      // Redirecionar para login se não houver token
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar se o token é válido
    const payload = verifyToken(token);
    
    if (!payload) {
      // Token inválido, redirecionar para login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      
      // Remover cookie inválido
      response.cookies.delete(AUTH_CONFIG.COOKIE_NAME);
      return response;
    }

    // Verificar se o token não expirou
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      // Token expirado, redirecionar para login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      
      // Remover cookie expirado
      response.cookies.delete(AUTH_CONFIG.COOKIE_NAME);
      return response;
    }

    // Adicionar informações do usuário aos headers para uso nas rotas
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-username', payload.username);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Para rotas não protegidas, continuar normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};