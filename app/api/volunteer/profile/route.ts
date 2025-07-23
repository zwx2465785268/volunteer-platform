import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { createPool } from '@/lib/database';

// 获取志愿者个人资料
export async function GET(request: NextRequest) {
  try {
    // 1. 验证token
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        error: { code: 'NO_TOKEN', message: '未提供认证令牌' }
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: '认证令牌无效或已过期' }
      }, { status: 401 });
    }

    const pool = createPool();

    // 2. 获取用户基本信息和志愿者详细信息
    const [userRows] = await pool.execute(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.phone_number,
        u.user_type,
        u.status,
        u.created_at,
        u.updated_at,
        v.id as volunteer_id,
        v.real_name,
        v.id_card_number,
        v.gender,
        v.date_of_birth,
        v.region,
        v.skills,
        v.interests,
        v.bio,
        v.total_service_hours,
        v.verification_status
      FROM users u
      LEFT JOIN volunteers v ON u.id = v.user_id
      WHERE u.id = ?
    `, [payload.userId]);

    const users = userRows as any[];
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: '用户不存在' }
      }, { status: 404 });
    }

    const user = users[0];

    // 3. 获取参与活动统计
    const [activityStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN app.status = 'approved' THEN 1 END) as approved_activities,
        COUNT(CASE WHEN app.status = 'pending' THEN 1 END) as pending_activities
      FROM applications app
      WHERE app.volunteer_id = ?
    `, [user.volunteer_id]);

    const stats = (activityStats as any[])[0] || {
      total_activities: 0,
      approved_activities: 0,
      pending_activities: 0
    };

    // 4. 处理JSON字段
    let skills = [];
    let interests = [];
    
    try {
      skills = user.skills ? JSON.parse(user.skills) : [];
    } catch (e) {
      skills = [];
    }
    
    try {
      interests = user.interests ? JSON.parse(user.interests) : [];
    } catch (e) {
      interests = [];
    }

    // 5. 构建响应数据
    const profileData = {
      // 志愿者ID信息
      id: user.volunteer_id,
      user_id: user.id,

      // 志愿者详细信息
      real_name: user.real_name,
      id_card_number: user.id_card_number,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      region: user.region,
      skills: skills,
      interests: interests,
      bio: user.bio,
      total_service_hours: parseFloat(user.total_service_hours || 0),
      verification_status: user.verification_status || 'pending',

      // 用户基本信息（只读）
      user: {
        username: user.username,
        email: user.email,
        phone_number: user.phone_number
      },

      // 统计信息（只读）
      stats: {
        total_activities: parseInt(stats.total_activities),
        approved_activities: parseInt(stats.approved_activities),
        pending_activities: parseInt(stats.pending_activities),
        service_hours: parseFloat(user.total_service_hours || 0)
      }
    };

    await pool.end();

    return NextResponse.json({
      success: true,
      data: { profile: profileData }
    });

  } catch (error) {
    console.error('获取志愿者资料失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取资料失败' }
    }, { status: 500 });
  }
}

// 更新志愿者个人资料
export async function PUT(request: NextRequest) {
  try {
    // 1. 验证token
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        error: { code: 'NO_TOKEN', message: '未提供认证令牌' }
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: '认证令牌无效或已过期' }
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      real_name,
      id_card_number,
      gender,
      date_of_birth,
      region,
      skills,
      interests,
      bio,
      user // 新增：用户基本信息
    } = body;

    const pool = createPool();

    // 2. 如果提供了用户基本信息，先更新用户表
    if (user && (user.username || user.email || user.phone_number)) {
      await pool.execute(`
        UPDATE users
        SET
          username = COALESCE(?, username),
          email = COALESCE(?, email),
          phone_number = COALESCE(?, phone_number),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        user.username,
        user.email,
        user.phone_number,
        payload.userId
      ]);
    }

    // 3. 更新志愿者详细信息
    await pool.execute(`
      UPDATE volunteers
      SET
        real_name = COALESCE(?, real_name),
        id_card_number = COALESCE(?, id_card_number),
        gender = COALESCE(?, gender),
        date_of_birth = COALESCE(?, date_of_birth),
        region = COALESCE(?, region),
        skills = COALESCE(?, skills),
        interests = COALESCE(?, interests),
        bio = COALESCE(?, bio),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [
      real_name,
      id_card_number,
      gender,
      date_of_birth,
      region,
      skills ? JSON.stringify(skills) : null,
      interests ? JSON.stringify(interests) : null,
      bio,
      payload.userId
    ]);

    await pool.end();

    return NextResponse.json({
      success: true,
      message: '个人资料更新成功'
    });

  } catch (error) {
    console.error('更新志愿者资料失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '更新资料失败' }
    }, { status: 500 });
  }
}
