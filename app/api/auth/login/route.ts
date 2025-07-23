import { NextRequest, NextResponse } from 'next/server';
import { 
  LoginRequest, 
  AuthResponse, 
  verifyPassword, 
  generateToken,
  isUserActive
} from '@/lib/auth';
import { findUserByIdentifier } from '@/lib/db/users';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 收到登录请求')
    const body: LoginRequest = await request.json();
    const { identifier, password } = body;
    console.log('📋 登录信息:', { identifier, password: '***' })

    // 1. 输入验证
    if (!identifier || !password) {
      console.log('❌ 缺少必要字段')
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: '请输入用户名/邮箱/手机号和密码'
        }
      }, { status: 400 });
    }

    // 2. 查找用户
    console.log('🔍 查询用户...')
    const dbUser = await findUserByIdentifier(identifier.trim());
    if (!dbUser) {
      console.log('❌ 用户不存在')
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      }, { status: 401 });
    }

    console.log('👤 找到用户:', { id: dbUser.id, username: dbUser.username, userType: dbUser.user_type })

    // 3. 验证密码
    console.log('🔐 验证密码...')
    const isPasswordValid = await verifyPassword(password, dbUser.password_hash);
    console.log('🔐 密码验证结果:', isPasswordValid ? '正确' : '错误')
    if (!isPasswordValid) {
      console.log('❌ 密码错误')
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      }, { status: 401 });
    }

    // 4. 检查用户状态（暂时只检查是否被禁用）
    if (dbUser.status === 'inactive') {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: '账户已被禁用，请联系管理员'
        }
      }, { status: 403 });
    }

    // 5. 生成JWT token
    const token = generateToken({
      userId: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      userType: dbUser.user_type,
      status: dbUser.status
    });

    // 6. 准备用户信息（移除敏感信息）
    const user = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      phone_number: dbUser.phone_number,
      user_type: dbUser.user_type,
      status: dbUser.status,
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at
    };

    // 7. 返回成功响应
    console.log('✅ 登录成功，准备返回响应')
    const response = NextResponse.json<AuthResponse>({
      success: true,
      data: {
        user,
        token
      }
    }, { status: 200 });

    // 8. 设置HTTP-only cookie（可选，增强安全性）
    console.log('🍪 设置cookie...')
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7天
    });

    console.log('📤 返回成功响应')
    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json<AuthResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '登录失败，请稍后重试'
      }
    }, { status: 500 });
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
