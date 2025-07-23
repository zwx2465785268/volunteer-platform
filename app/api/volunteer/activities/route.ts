import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { createPool } from '@/lib/database';

// 获取志愿者的活动列表
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || 'all'; // all, upcoming, completed, pending

    const offset = (page - 1) * limit;
    const pool = createPool();

    // 2. 获取志愿者ID
    const [volunteerRows] = await pool.execute(`
      SELECT id FROM volunteers WHERE user_id = ?
    `, [payload.userId]);

    const volunteers = volunteerRows as any[];
    if (volunteers.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'VOLUNTEER_NOT_FOUND', message: '志愿者信息不存在' }
      }, { status: 404 });
    }

    const volunteerId = volunteers[0].id;

    // 3. 构建查询条件
    let whereConditions = ['app.volunteer_id = ?'];
    let queryParams: any[] = [volunteerId];

    if (status) {
      whereConditions.push('app.status = ?');
      queryParams.push(status);
    }

    // 根据类型筛选
    if (type === 'upcoming') {
      whereConditions.push('a.start_time > NOW()');
      whereConditions.push('app.status = "approved"');
    } else if (type === 'completed') {
      whereConditions.push('a.end_time < NOW()');
      whereConditions.push('app.status = "approved"');
    } else if (type === 'pending') {
      whereConditions.push('app.status = "pending"');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 4. 获取活动列表
    const [activityRows] = await pool.execute(`
      SELECT 
        app.id as application_id,
        app.status as application_status,
        app.application_time,
        app.application_message,
        app.review_message,
        app.reviewed_at,
        a.id as activity_id,
        a.title,
        a.description,
        a.category,
        a.start_time,
        a.end_time,
        a.location,
        a.required_volunteers,
        a.current_volunteers,
        a.required_skills,
        a.status as activity_status,
        o.organization_name,
        o.contact_person,
        o.contact_phone
      FROM applications app
      LEFT JOIN activities a ON app.activity_id = a.id
      LEFT JOIN organizations o ON a.organization_id = o.id
      ${whereClause}
      ORDER BY app.application_time DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // 5. 获取总数
    const [countRows] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM applications app
      LEFT JOIN activities a ON app.activity_id = a.id
      ${whereClause}
    `, queryParams);

    const total = (countRows as any[])[0].total;

    // 6. 处理数据
    const activities = (activityRows as any[]).map(row => {
      let requiredSkills = [];
      try {
        requiredSkills = row.required_skills ? JSON.parse(row.required_skills) : [];
      } catch (e) {
        requiredSkills = [];
      }

      return {
        application_id: row.application_id,
        application_status: row.application_status,
        application_time: row.application_time,
        application_message: row.application_message,
        review_message: row.review_message,
        reviewed_at: row.reviewed_at,
        activity: {
          id: row.activity_id,
          title: row.title,
          description: row.description,
          category: row.category,
          start_time: row.start_time,
          end_time: row.end_time,
          location: row.location,
          required_volunteers: row.required_volunteers,
          current_volunteers: row.current_volunteers,
          required_skills: requiredSkills,
          status: row.activity_status
        },
        organization: {
          name: row.organization_name,
          contact_person: row.contact_person,
          contact_phone: row.contact_phone
        }
      };
    });

    await pool.end();

    return NextResponse.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取志愿者活动失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取活动列表失败' }
    }, { status: 500 });
  }
}
