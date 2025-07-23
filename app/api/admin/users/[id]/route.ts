import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '../../../../../lib/database';
import { verifyToken } from '../../../../../lib/auth';
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

// GET - 获取单个用户详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = params.id;

    // 查询用户详细信息
    const [users] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.phone_number,
        u.user_type,
        u.status,
        u.created_at,
        u.updated_at,
        v.real_name,
        v.id_card_number,
        v.gender,
        v.date_of_birth,
        v.region,
        v.skills,
        v.interests,
        v.bio,
        v.total_service_hours,
        v.verification_status,
        o.organization_name,
        o.unified_social_credit_code,
        o.contact_person,
        o.contact_phone,
        o.contact_email,
        o.address,
        o.description as org_description,
        o.status as org_status
      FROM users u
      LEFT JOIN volunteers v ON u.id = v.user_id
      LEFT JOIN organizations o ON u.id = o.user_id
      WHERE u.id = ?
    `, [userId]);

    if (users.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json(
      { error: '获取用户详情失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新用户信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = params.id;
    const body = await request.json();
    const { username, email, phone_number, status, real_name, organization_name, verification_status } = body;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 检查用户是否存在
      const [existingUsers] = await connection.execute<RowDataPacket[]>(
        'SELECT user_type FROM users WHERE id = ?',
        [userId]
      );

      if (existingUsers.length === 0) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }

      const userType = existingUsers[0].user_type;

      // 更新用户基础信息
      if (username || email || phone_number || status) {
        let updateFields = [];
        let updateValues = [];

        if (username) {
          updateFields.push('username = ?');
          updateValues.push(username);
        }
        if (email) {
          updateFields.push('email = ?');
          updateValues.push(email);
        }
        if (phone_number) {
          updateFields.push('phone_number = ?');
          updateValues.push(phone_number);
        }
        if (status) {
          updateFields.push('status = ?');
          updateValues.push(status);
        }

        if (updateFields.length > 0) {
          updateValues.push(userId);
          await connection.execute<ResultSetHeader>(
            `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            updateValues
          );
        }
      }

      // 更新志愿者信息
      if (userType === 'volunteer' && (real_name || verification_status)) {
        let updateFields = [];
        let updateValues = [];

        if (real_name) {
          updateFields.push('real_name = ?');
          updateValues.push(real_name);
        }
        if (verification_status) {
          updateFields.push('verification_status = ?');
          updateValues.push(verification_status);
        }

        if (updateFields.length > 0) {
          updateValues.push(userId);
          await connection.execute<ResultSetHeader>(
            `UPDATE volunteers SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
            updateValues
          );
        }
      }

      // 更新组织信息
      if (userType === 'organization_admin' && organization_name) {
        await connection.execute<ResultSetHeader>(
          `UPDATE organizations SET organization_name = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
          [organization_name, userId]
        );
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: '用户信息更新成功'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json(
      { error: '更新用户信息失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = params.id;

    // 检查用户是否存在
    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 删除用户（由于外键约束，相关记录会自动删除）
    await pool.execute<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: '用户删除成功'
    });

  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json(
      { error: '删除用户失败' },
      { status: 500 }
    );
  }
}
