import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // パブリックパスの定義
  const isPublicPath = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/api/auth',
    '/_next',
    '/images',
    '/favicon.ico'
  ].some(publicPath => path.startsWith(publicPath));

  // セッショントークンの取得
  const token = request.cookies.get('next-auth.session-token')?.value || 
                request.cookies.get('__Secure-next-auth.session-token')?.value || '';

  // ルートページは常にアクセス可能
  if (path === '/') {
    return NextResponse.next();
  }

  // 認証が必要なパスへの未認証アクセス
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 認証済みユーザーのパブリックパスへのアクセス
  if (token && (path === '/login' || path === '/register' || path === '/forgot-password')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
