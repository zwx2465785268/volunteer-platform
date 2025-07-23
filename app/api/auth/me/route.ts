import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { findUserById } from '@/lib/db/users';

export async function GET(request: NextRequest) {
  try {
    // 1. 提取token
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: '未提供认证令牌'
        }
      }, { status: 401 });
    }

    // 2. 验证token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '认证令牌无效或已过期'
        }
      }, { status: 401 });
    }

    // 3. 获取最新用户信息
    const user = await findUserById(payload.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在'
        }
      }, { status: 404 });
    }

    // 4. 返回用户信息
    return NextResponse.json({
      success: true,
      data: {
        user
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get user info error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '获取用户信息失败'
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
