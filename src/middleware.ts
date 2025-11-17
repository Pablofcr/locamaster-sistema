import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar se está acessando rota protegida do dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Verificar se tem token de sessão do NextAuth
    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                        request.cookies.get('__Secure-next-auth.session-token')?.value;

    // Se não tem sessão, redirecionar para login
    if (!sessionToken) {
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Permitir acesso
  return NextResponse.next();
}

export const config = {
  // Aplicar middleware apenas nas rotas do dashboard
  matcher: ['/dashboard/:path*']
};
