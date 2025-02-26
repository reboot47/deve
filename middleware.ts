import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('ミドルウェア実行:', req.nextUrl.pathname);
  
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log('トークン状態:', !!token);
  
  // 認証が必要なルート
  const authRoutes = ['/dashboard', '/settings'];
  // 認証済みユーザーがアクセスできないルート
  const publicAuthRoutes = ['/login', '/register', '/forgot-password'];
  
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );
  
  const isPublicAuthRoute = publicAuthRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route)
  );

  // ログイン済みの場合、ログインページなどにアクセスするとダッシュボードにリダイレクト
  if (isPublicAuthRoute && token) {
    console.log('認証済みユーザーが公開認証ルートにアクセス - リダイレクト');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 未ログインで認証が必要なページにアクセスするとログインページにリダイレクト
  if (isAuthRoute && !token) {
    console.log('未認証ユーザーが保護されたルートにアクセス - リダイレクト');
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(req.url)}`, req.url)
    );
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
