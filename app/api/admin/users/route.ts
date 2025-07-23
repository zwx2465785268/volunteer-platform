import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '../../../../lib/database';
import { verifyToken } from '../../../../lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 从请求中提取 token 的辅助函数
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

const pool = createPool();

// 用户数据接口
interface UserData extends RowDataPacket {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  user_type: 'volunteer' | 'organization_admin' | 'platform_admin';
  status: 'active' | 'inactive' | 'pending_verification';
  created_at: Date;
  updated_at: Date;
  real_name?: string;
  organization_name?: string;
  total_service_hours?: number;
  verification_status?: string;
}

// GET - 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: '缺少认证令牌' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 });
    }

    if (decoded.userType !== 'platform_admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const userType = searchParams.get('userType') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (userType) {
      whereClause += ' AND user_type = ?';
      queryParams.push(userType);
    }

    if (status) {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }

    // 构建完整的SQL查询 - 先简化，只查询users表
    const userQuery = `
      SELECT
        id,
        username,
        email,
        phone_number,
        user_type,
        status,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      ${whereClause}
    `;

    // 构建最终查询（直接拼接 LIMIT 和 OFFSET）
    const finalQuery = userQuery.replace('LIMIT ? OFFSET ?', `LIMIT ${limit} OFFSET ${offset}`);
    const finalCountQuery = countQuery;

    console.log('执行用户查询:', { queryParams, limit, offset, finalQuery });
    const [users] = await pool.execute<UserData[]>(finalQuery, queryParams);

    // 查询总数
    console.log('执行计数查询:', { queryParams });
    const [countResult] = await pool.execute<RowDataPacket[]>(finalCountQuery, queryParams);

    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新用户
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: '缺少认证令牌' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 });
    }

    if (decoded.userType !== 'platform_admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await request.json();
    const { username, email, phone_number, password, user_type, real_name, organization_name } = body;

    // 验证必填字段
    if (!username || !email || !phone_number || !password || !user_type) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 检查用户名、邮箱、手机号是否已存在
      const [existingUsers] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE username = ? OR email = ? OR phone_number = ?',
        [username, email, phone_number]
      );

      if (existingUsers.length > 0) {
        return NextResponse.json({ error: '用户名、邮箱或手机号已存在' }, { status: 400 });
      }

      // 生成密码哈希
      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();

      // 插入用户基础信息
      await connection.execute<ResultSetHeader>(
        `INSERT INTO users (id, username, password_hash, email, phone_number, user_type, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [userId, username, password_hash, email, phone_number, user_type]
      );

      // 根据用户类型创建相应的详细信息记录
      if (user_type === 'volunteer' && real_name) {
        await connection.execute<ResultSetHeader>(
          `INSERT INTO volunteers (id, user_id, real_name, verification_status) 
           VALUES (?, ?, ?, 'pending')`,
          [crypto.randomUUID(), userId, real_name]
        );
      } else if (user_type === 'organization_admin' && organization_name) {
        await connection.execute<ResultSetHeader>(
          `INSERT INTO organizations (id, user_id, organization_name, unified_social_credit_code, contact_person, contact_phone, contact_email, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_review')`,
          [crypto.randomUUID(), userId, organization_name, 'TEMP-' + Date.now(), real_name || username, phone_number, email]
        );
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: '用户创建成功',
        data: { userId }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    );
  }
}
