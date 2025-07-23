import { NextRequest, NextResponse } from 'next/server';

// 需要认证的路径
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/activities/create',
  '/activities/manage',
  '/admin'
];

// 公开路径（不需要认证）
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/login-success',
  '/activities',
  '/about',
  '/contact'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('🔄 中间件处理路径:', pathname);

  // 跳过API路由、静态文件和Next.js内部路径
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 检查是否为公开路径
  const isPublicPath = publicPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  );

  // 检查是否为受保护路径
  const isProtectedPath = protectedPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  );

  console.log('📋 路径分析:', { pathname, isPublicPath, isProtectedPath });

  // 如果是公开路径，直接通过
  if (isPublicPath && !isProtectedPath) {
    console.log('✅ 公开路径，直接通过');
    return NextResponse.next();
  }

  // 简单的token检查（不验证内容，只检查是否存在）
  const token = request.cookies.get('auth-token')?.value;
  console.log('🍪 Token状态:', token ? '存在' : '不存在');

  // 如果没有token且访问受保护路径，重定向到登录页
  if (!token && isProtectedPath) {
    console.log('❌ 无token访问受保护路径，重定向到登录页');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果有token且访问登录/注册页面，重定向到仪表板
  // 但是要避免在登录过程中的重定向冲突
  if (token && (pathname === '/login' || pathname === '/register')) {
    // 检查是否是登录后的重定向请求
    const isRedirectRequest = request.nextUrl.searchParams.has('redirect');
    console.log('🔄 已登录用户访问登录页:', { isRedirectRequest });

    if (!isRedirectRequest) {
      // 只有在不是重定向请求时才进行自动跳转
      // 默认重定向到dashboard，让前端根据用户类型决定最终页面
      const redirectTo = '/dashboard';
      console.log('🔄 自动重定向到:', redirectTo);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  console.log('✅ 中间件通过');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


