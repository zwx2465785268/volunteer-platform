import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { createPool } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

// 申请参加活动
export async function POST(request: NextRequest) {
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
    const { activity_id, application_message } = body;

    if (!activity_id) {
      return NextResponse.json({
        success: false,
        error: { code: 'MISSING_ACTIVITY_ID', message: '活动ID不能为空' }
      }, { status: 400 });
    }

    const pool = createPool();

    // 2. 获取志愿者ID
    const [volunteerRows] = await pool.execute(`
      SELECT id, verification_status FROM volunteers WHERE user_id = ?
    `, [payload.userId]);

    const volunteers = volunteerRows as any[];
    if (volunteers.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'VOLUNTEER_NOT_FOUND', message: '志愿者信息不存在' }
      }, { status: 404 });
    }

    const volunteer = volunteers[0];

    // 3. 检查志愿者认证状态
    if (volunteer.verification_status !== 'verified') {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_VERIFIED', message: '请先完成身份认证才能申请活动' }
      }, { status: 403 });
    }

    // 4. 检查活动是否存在且可申请
    const [activityRows] = await pool.execute(`
      SELECT 
        id,
        title,
        status,
        start_time,
        required_volunteers,
        current_volunteers
      FROM activities 
      WHERE id = ?
    `, [activity_id]);

    const activities = activityRows as any[];
    if (activities.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'ACTIVITY_NOT_FOUND', message: '活动不存在' }
      }, { status: 404 });
    }

    const activity = activities[0];

    // 5. 检查活动状态
    if (activity.status !== 'published') {
      return NextResponse.json({
        success: false,
        error: { code: 'ACTIVITY_NOT_AVAILABLE', message: '活动暂不接受申请' }
      }, { status: 400 });
    }

    // 6. 检查活动是否已开始
    if (new Date(activity.start_time) <= new Date()) {
      return NextResponse.json({
        success: false,
        error: { code: 'ACTIVITY_STARTED', message: '活动已开始，无法申请' }
      }, { status: 400 });
    }

    // 7. 检查是否已申请过
    const [existingRows] = await pool.execute(`
      SELECT id FROM applications 
      WHERE volunteer_id = ? AND activity_id = ?
    `, [volunteer.id, activity_id]);

    if ((existingRows as any[]).length > 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'ALREADY_APPLIED', message: '您已申请过此活动' }
      }, { status: 400 });
    }

    // 8. 检查活动是否已满员
    if (activity.current_volunteers >= activity.required_volunteers) {
      return NextResponse.json({
        success: false,
        error: { code: 'ACTIVITY_FULL', message: '活动报名已满' }
      }, { status: 400 });
    }

    // 9. 创建申请记录
    const applicationId = uuidv4();
    await pool.execute(`
      INSERT INTO applications (
        id,
        volunteer_id,
        activity_id,
        status,
        application_message,
        application_time
      ) VALUES (?, ?, ?, 'pending', ?, NOW())
    `, [applicationId, volunteer.id, activity_id, application_message || '']);

    // 10. 更新活动当前志愿者数量（待审核状态也计入）
    await pool.execute(`
      UPDATE activities 
      SET current_volunteers = current_volunteers + 1
      WHERE id = ?
    `, [activity_id]);

    await pool.end();

    return NextResponse.json({
      success: true,
      data: {
        application_id: applicationId,
        message: '申请提交成功，请等待审核'
      }
    });

  } catch (error) {
    console.error('申请活动失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '申请提交失败' }
    }, { status: 500 });
  }
}

// 取消申请
export async function DELETE(request: NextRequest) {
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
    const applicationId = searchParams.get('application_id');

    if (!applicationId) {
      return NextResponse.json({
        success: false,
        error: { code: 'MISSING_APPLICATION_ID', message: '申请ID不能为空' }
      }, { status: 400 });
    }

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

    // 3. 检查申请是否存在且属于当前用户
    const [applicationRows] = await pool.execute(`
      SELECT 
        app.id,
        app.activity_id,
        app.status,
        a.start_time
      FROM applications app
      LEFT JOIN activities a ON app.activity_id = a.id
      WHERE app.id = ? AND app.volunteer_id = ?
    `, [applicationId, volunteerId]);

    const applications = applicationRows as any[];
    if (applications.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: '申请记录不存在' }
      }, { status: 404 });
    }

    const application = applications[0];

    // 4. 检查是否可以取消（只有pending状态且活动未开始才能取消）
    if (application.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: { code: 'CANNOT_CANCEL', message: '只能取消待审核的申请' }
      }, { status: 400 });
    }

    if (new Date(application.start_time) <= new Date()) {
      return NextResponse.json({
        success: false,
        error: { code: 'ACTIVITY_STARTED', message: '活动已开始，无法取消申请' }
      }, { status: 400 });
    }

    // 5. 删除申请记录
    await pool.execute(`
      DELETE FROM applications WHERE id = ?
    `, [applicationId]);

    // 6. 更新活动当前志愿者数量
    await pool.execute(`
      UPDATE activities 
      SET current_volunteers = GREATEST(current_volunteers - 1, 0)
      WHERE id = ?
    `, [application.activity_id]);

    await pool.end();

    return NextResponse.json({
      success: true,
      message: '申请已取消'
    });

  } catch (error) {
    console.error('取消申请失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '取消申请失败' }
    }, { status: 500 });
  }
}
