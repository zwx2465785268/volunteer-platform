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

// GET - 获取单个活动详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [activities] = await pool.execute(
      `SELECT a.*, o.organization_name 
       FROM activities a 
       LEFT JOIN organizations o ON a.organization_id = o.id 
       WHERE a.id = ?`,
      [id]
    );

    const activityList = activities as Activity[];
    
    if (activityList.length === 0) {
      return NextResponse.json({
        success: false,
        error: '活动不存在'
      }, { status: 404 });
    }

    const activity = activityList[0];

    // 处理数据格式
    let requiredSkills: string[] = [];
    if (activity.required_skills) {
      try {
        if (Array.isArray(activity.required_skills)) {
          requiredSkills = activity.required_skills;
        } else if (typeof activity.required_skills === 'string') {
          try {
            requiredSkills = JSON.parse(activity.required_skills);
          } catch (error) {
            requiredSkills = activity.required_skills.split(',').map(skill => skill.trim()).filter(skill => skill);
          }
        } else {
          requiredSkills = String(activity.required_skills).split(',').map(skill => skill.trim()).filter(skill => skill);
        }
      } catch (error) {
        console.error('解析required_skills失败:', error);
        requiredSkills = [];
      }
    }

    const processedActivity = {
      ...activity,
      required_skills: requiredSkills,
      start_time: new Date(activity.start_time).toISOString(),
      end_time: new Date(activity.end_time).toISOString(),
      created_at: new Date(activity.created_at).toISOString(),
      updated_at: new Date(activity.updated_at).toISOString()
    };

    return NextResponse.json({
      success: true,
      data: processedActivity
    });

  } catch (error) {
    console.error('获取活动详情失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取活动详情失败'
    }, { status: 500 });
  }
}

// PUT - 更新活动
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      category,
      start_time,
      end_time,
      location,
      required_volunteers,
      required_skills,
      status
    } = body;

    // 验证活动是否存在
    const [existingActivities] = await pool.execute(
      'SELECT id FROM activities WHERE id = ?',
      [id]
    );

    if ((existingActivities as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        error: '活动不存在'
      }, { status: 404 });
    }

    // 验证时间
    if (start_time && end_time) {
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);
      
      if (startTime >= endTime) {
        return NextResponse.json({
          success: false,
          error: '结束时间必须晚于开始时间'
        }, { status: 400 });
      }
    }

    // 构建更新字段
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }
    if (start_time !== undefined) {
      updateFields.push('start_time = ?');
      updateValues.push(start_time);
    }
    if (end_time !== undefined) {
      updateFields.push('end_time = ?');
      updateValues.push(end_time);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }
    if (required_volunteers !== undefined) {
      updateFields.push('required_volunteers = ?');
      updateValues.push(required_volunteers);
    }
    if (required_skills !== undefined) {
      updateFields.push('required_skills = ?');
      updateValues.push(JSON.stringify(required_skills));
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有要更新的字段'
      }, { status: 400 });
    }

    // 执行更新
    const updateQuery = `
      UPDATE activities 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.execute(updateQuery, [...updateValues, id]);

    // 获取更新后的活动详情
    const [updatedActivities] = await pool.execute(
      `SELECT a.*, o.organization_name 
       FROM activities a 
       LEFT JOIN organizations o ON a.organization_id = o.id 
       WHERE a.id = ?`,
      [id]
    );

    const activity = (updatedActivities as Activity[])[0];

    // 处理数据格式
    let requiredSkillsProcessed: string[] = [];
    if (activity.required_skills) {
      try {
        if (Array.isArray(activity.required_skills)) {
          requiredSkillsProcessed = activity.required_skills;
        } else if (typeof activity.required_skills === 'string') {
          try {
            requiredSkillsProcessed = JSON.parse(activity.required_skills);
          } catch (error) {
            requiredSkillsProcessed = activity.required_skills.split(',').map(skill => skill.trim()).filter(skill => skill);
          }
        } else {
          requiredSkillsProcessed = String(activity.required_skills).split(',').map(skill => skill.trim()).filter(skill => skill);
        }
      } catch (error) {
        console.error('解析required_skills失败:', error);
        requiredSkillsProcessed = [];
      }
    }

    const processedActivity = {
      ...activity,
      required_skills: requiredSkillsProcessed,
      start_time: new Date(activity.start_time).toISOString(),
      end_time: new Date(activity.end_time).toISOString(),
      created_at: new Date(activity.created_at).toISOString(),
      updated_at: new Date(activity.updated_at).toISOString()
    };

    return NextResponse.json({
      success: true,
      data: processedActivity,
      message: '活动更新成功'
    });

  } catch (error) {
    console.error('更新活动失败:', error);
    return NextResponse.json({
      success: false,
      error: '更新活动失败'
    }, { status: 500 });
  }
}

// DELETE - 删除活动
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证活动是否存在
    const [existingActivities] = await pool.execute(
      'SELECT id, status FROM activities WHERE id = ?',
      [id]
    );

    const activityList = existingActivities as any[];
    
    if (activityList.length === 0) {
      return NextResponse.json({
        success: false,
        error: '活动不存在'
      }, { status: 404 });
    }

    const activity = activityList[0];

    // 检查是否可以删除（只有草稿状态的活动可以删除）
    if (activity.status !== 'draft') {
      return NextResponse.json({
        success: false,
        error: '只有草稿状态的活动可以删除'
      }, { status: 400 });
    }

    // 删除活动
    await pool.execute('DELETE FROM activities WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: '活动删除成功'
    });

  } catch (error) {
    console.error('删除活动失败:', error);
    return NextResponse.json({
      success: false,
      error: '删除活动失败'
    }, { status: 500 });
  }
}
