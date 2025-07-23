import { NextRequest, NextResponse } from 'next/server';
import { 
  RegisterRequest, 
  AuthResponse, 
  hashPassword, 
  generateToken,
  isValidEmail,
  isValidPhoneNumber,
  isValidPassword,
  isValidUsername
} from '@/lib/auth';
import { 
  createUser, 
  isUsernameExists, 
  isEmailExists, 
  isPhoneExists 
} from '@/lib/db/users';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { username, email, phone_number, password, user_type } = body;

    // 1. 输入验证
    if (!username || !email || !phone_number || !password || !user_type) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: '请填写所有必填字段'
        }
      }, { status: 400 });
    }

    // 2. 格式验证
    const usernameValidation = isValidUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'INVALID_USERNAME',
          message: usernameValidation.message!
        }
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: '邮箱格式不正确'
        }
      }, { status: 400 });
    }

    if (!isValidPhoneNumber(phone_number)) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: '手机号格式不正确'
        }
      }, { status: 400 });
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: passwordValidation.message!
        }
      }, { status: 400 });
    }

    if (!['volunteer', 'organization_admin'].includes(user_type)) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'INVALID_USER_TYPE',
          message: '用户类型不正确'
        }
      }, { status: 400 });
    }

    // 3. 检查重复性
    const [usernameExists, emailExists, phoneExists] = await Promise.all([
      isUsernameExists(username),
      isEmailExists(email),
      isPhoneExists(phone_number)
    ]);

    if (usernameExists) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: '用户名已存在'
        }
      }, { status: 409 });
    }

    if (emailExists) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: '邮箱已被注册'
        }
      }, { status: 409 });
    }

    if (phoneExists) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: {
          code: 'PHONE_EXISTS',
          message: '手机号已被注册'
        }
      }, { status: 409 });
    }

    // 4. 创建用户
    const password_hash = await hashPassword(password);
    const user = await createUser({
      username,
      email,
      phone_number,
      password,
      user_type,
      password_hash
    });

    // 5. 生成JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      userType: user.user_type,
      status: user.status
    });

    // 6. 返回成功响应
    return NextResponse.json<AuthResponse>({
      success: true,
      data: {
        user,
        token
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json<AuthResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '注册失败，请稍后重试'
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
