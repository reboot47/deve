import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// シンプルなミドルウェアの実装
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // デバッグログ
  console.log('Middleware:', {
    pathname,
    hasToken: !!token,
  });

  // 認証が必要なパス
  const protectedPaths = ['/dashboard', '/settings', '/profile'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // 認証ページのパス
  const authPaths = ['/login', '/register', '/forgot-password'];
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // 認証済みユーザーがアクセスできないパス
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 未認証ユーザーが認証必須のパスにアクセス
  if (!token && isProtectedPath) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // APIルートとNext.jsの内部ルートは無視
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  // ルートページへのアクセスは常に許可
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// マッチャーの設定
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/login/:path*',
    '/register/:path*',
    '/forgot-password/:path*',
    /*
     * 以下を除く全てのルートにマッチ:
     * - api (API routes)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
