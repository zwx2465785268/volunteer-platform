import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

// 活动数据接口
interface Activity extends RowDataPacket {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  category: string;
  start_time: string;
  end_time: string;
  location: string;
  required_volunteers: number;
  current_volunteers: number;
  required_skills: string;
  status: 'draft' | 'pending_review' | 'recruiting' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  organization_name?: string;
}

const pool = createPool();

// GET - 获取活动列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const organizationId = searchParams.get('organizationId') || '';

    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereConditions = ['1=1'];
    let queryParams: any[] = [];

    if (search) {
      whereConditions.push('(title LIKE ? OR description LIKE ? OR location LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }

    if (status) {
      whereConditions.push('status = ?');
      queryParams.push(status);
    }

    if (organizationId) {
      whereConditions.push('organization_id = ?');
      queryParams.push(organizationId);
    }

    const whereClause = whereConditions.join(' AND ');

    // 查询活动列表 - 先简化查询
    const activitiesQuery = `
      SELECT
        id,
        organization_id,
        title,
        description,
        category,
        start_time,
        end_time,
        location,
        required_volunteers,
        current_volunteers,
        required_skills,
        status,
        created_at,
        updated_at
      FROM activities
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    // 先尝试不带参数的简单查询
    const simpleQuery = `
      SELECT
        id,
        organization_id,
        title,
        description,
        category,
        start_time,
        end_time,
        location,
        required_volunteers,
        current_volunteers,
        required_skills,
        status,
        created_at,
        updated_at
      FROM activities
      ORDER BY created_at DESC
      LIMIT 5 OFFSET 0
    `;

    console.log('执行简单活动查询:', {
      query: simpleQuery
    });

    const [activities] = await pool.execute(simpleQuery);

    // 查询总数 - 简化版本
    const countQuery = `SELECT COUNT(*) as total FROM activities`;
    const [countResult] = await pool.execute(countQuery);
    const total = (countResult as any[])[0].total;

    // 处理活动数据
    const processedActivities = (activities as Activity[]).map(activity => {
      let requiredSkills: string[] = [];

      // 安全地解析required_skills
      if (activity.required_skills) {
        try {
          // 如果已经是数组
          if (Array.isArray(activity.required_skills)) {
            requiredSkills = activity.required_skills;
          }
          // 如果是字符串，尝试JSON解析
          else if (typeof activity.required_skills === 'string') {
            try {
              requiredSkills = JSON.parse(activity.required_skills);
            } catch (error) {
              // 如果不是JSON格式，按逗号分割
              requiredSkills = activity.required_skills.split(',').map(skill => skill.trim()).filter(skill => skill);
            }
          }
          // 其他情况转为字符串处理
          else {
            requiredSkills = String(activity.required_skills).split(',').map(skill => skill.trim()).filter(skill => skill);
          }
        } catch (error) {
          console.error('解析required_skills失败:', error);
          requiredSkills = [];
        }
      }

      return {
        ...activity,
        required_skills: requiredSkills,
        start_time: new Date(activity.start_time).toISOString(),
        end_time: new Date(activity.end_time).toISOString(),
        created_at: new Date(activity.created_at).toISOString(),
        updated_at: new Date(activity.updated_at).toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      data: processedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取活动列表失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取活动列表失败'
    }, { status: 500 });
  }
}

// POST - 创建新活动
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organization_id,
      title,
      description,
      category,
      start_time,
      end_time,
      location,
      required_volunteers,
      required_skills,
      status = 'draft'
    } = body;

    // 验证必填字段
    if (!organization_id || !title || !start_time || !end_time || !location || !required_volunteers) {
      return NextResponse.json({
        success: false,
        error: '请填写所有必填字段'
      }, { status: 400 });
    }

    // 验证时间
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    
    if (startTime >= endTime) {
      return NextResponse.json({
        success: false,
        error: '结束时间必须晚于开始时间'
      }, { status: 400 });
    }

    if (startTime < new Date()) {
      return NextResponse.json({
        success: false,
        error: '开始时间不能早于当前时间'
      }, { status: 400 });
    }

    // 插入新活动
    const insertQuery = `
      INSERT INTO activities (
        organization_id, title, description, category, start_time, end_time,
        location, required_volunteers, required_skills, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const skillsJson = required_skills ? JSON.stringify(required_skills) : null;

    const [result] = await pool.execute(insertQuery, [
      organization_id,
      title,
      description || null,
      category || null,
      start_time,
      end_time,
      location,
      required_volunteers,
      skillsJson,
      status
    ]);

    const insertId = (result as any).insertId;

    // 获取创建的活动详情
    const [newActivity] = await pool.execute(
      `SELECT a.*, o.organization_name 
       FROM activities a 
       LEFT JOIN organizations o ON a.organization_id = o.id 
       WHERE a.id = ?`,
      [insertId]
    );

    const activity = (newActivity as Activity[])[0];
    const processedActivity = {
      ...activity,
      required_skills: activity.required_skills ? JSON.parse(activity.required_skills) : [],
      start_time: new Date(activity.start_time).toISOString(),
      end_time: new Date(activity.end_time).toISOString(),
      created_at: new Date(activity.created_at).toISOString(),
      updated_at: new Date(activity.updated_at).toISOString()
    };

    return NextResponse.json({
      success: true,
      data: processedActivity,
      message: '活动创建成功'
    });

  } catch (error) {
    console.error('创建活动失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建活动失败'
    }, { status: 500 });
  }
}
