import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

const pool = createPool();

// PUT - 审核操作（通过/拒绝）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, action, review_message } = body;

    if (!type || !action) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: '无效的审核操作'
      }, { status: 400 });
    }

    let updateQuery = '';
    let updateParams: any[] = [];
    let notificationData: any = {};

    switch (type) {
      case 'organization':
        const newOrgStatus = action === 'approve' ? 'approved' : 'rejected';
        updateQuery = `
          UPDATE organizations 
          SET status = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
        updateParams = [newOrgStatus, id];

        // 获取组织信息用于通知
        const [orgResult] = await pool.execute(
          'SELECT o.*, u.id as user_id FROM organizations o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
          [id]
        );
        const orgData = (orgResult as any[])[0];
        
        if (orgData) {
          notificationData = {
            user_id: orgData.user_id,
            type: 'system',
            title: `组织审核${action === 'approve' ? '通过' : '被拒绝'}`,
            content: `您的组织"${orgData.organization_name}"审核${action === 'approve' ? '已通过' : '被拒绝'}${review_message ? `，原因：${review_message}` : ''}`,
            related_id: id
          };
        }
        break;

      case 'activity':
        const newActivityStatus = action === 'approve' ? 'recruiting' : 'rejected';
        updateQuery = `
          UPDATE activities 
          SET status = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
        updateParams = [newActivityStatus, id];

        // 获取活动信息用于通知
        const [actResult] = await pool.execute(
          `SELECT a.*, o.user_id FROM activities a 
           LEFT JOIN organizations o ON a.organization_id = o.id 
           WHERE a.id = ?`,
          [id]
        );
        const actData = (actResult as any[])[0];
        
        if (actData) {
          notificationData = {
            user_id: actData.user_id,
            type: 'activity',
            title: `活动审核${action === 'approve' ? '通过' : '被拒绝'}`,
            content: `您的活动"${actData.title}"审核${action === 'approve' ? '已通过，可以开始招募志愿者' : '被拒绝'}${review_message ? `，原因：${review_message}` : ''}`,
            related_id: id
          };
        }
        break;

      case 'application':
        const newAppStatus = action === 'approve' ? 'approved' : 'rejected';
        updateQuery = `
          UPDATE applications 
          SET status = ?, review_message = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
        updateParams = [newAppStatus, review_message || null, id];

        // 获取报名信息用于通知
        const [appResult] = await pool.execute(
          `SELECT app.*, v.user_id, a.title as activity_title 
           FROM applications app 
           LEFT JOIN volunteers v ON app.volunteer_id = v.id 
           LEFT JOIN activities a ON app.activity_id = a.id 
           WHERE app.id = ?`,
          [id]
        );
        const appData = (appResult as any[])[0];
        
        if (appData) {
          notificationData = {
            user_id: appData.user_id,
            type: 'application',
            title: `报名申请${action === 'approve' ? '通过' : '被拒绝'}`,
            content: `您对活动"${appData.activity_title}"的报名申请${action === 'approve' ? '已通过' : '被拒绝'}${review_message ? `，原因：${review_message}` : ''}`,
            related_id: id
          };
        }
        break;

      case 'volunteer':
        const newVolStatus = action === 'approve' ? 'verified' : 'rejected';
        updateQuery = `
          UPDATE volunteers 
          SET verification_status = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
        updateParams = [newVolStatus, id];

        // 获取志愿者信息用于通知
        const [volResult] = await pool.execute(
          'SELECT v.*, u.id as user_id FROM volunteers v LEFT JOIN users u ON v.user_id = u.id WHERE v.id = ?',
          [id]
        );
        const volData = (volResult as any[])[0];
        
        if (volData) {
          notificationData = {
            user_id: volData.user_id,
            type: 'system',
            title: `志愿者身份认证${action === 'approve' ? '通过' : '被拒绝'}`,
            content: `您的志愿者身份认证${action === 'approve' ? '已通过，现在可以报名参加活动' : '被拒绝'}${review_message ? `，原因：${review_message}` : ''}`,
            related_id: id
          };
        }
        break;

      default:
        return NextResponse.json({
          success: false,
          error: '无效的审核类型'
        }, { status: 400 });
    }

    // 执行更新操作
    await pool.execute(updateQuery, updateParams);

    // 发送通知
    if (notificationData.user_id) {
      await pool.execute(
        `INSERT INTO notifications (user_id, type, title, content, related_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          notificationData.user_id,
          notificationData.type,
          notificationData.title,
          notificationData.content,
          notificationData.related_id
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: `审核${action === 'approve' ? '通过' : '拒绝'}成功`
    });

  } catch (error) {
    console.error('审核操作失败:', error);
    return NextResponse.json({
      success: false,
      error: '审核操作失败'
    }, { status: 500 });
  }
}

// GET - 获取单个审核项目详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({
        success: false,
        error: '缺少类型参数'
      }, { status: 400 });
    }

    let query = '';
    let result: any;

    switch (type) {
      case 'organization':
        query = `
          SELECT o.*, u.username, u.email 
          FROM organizations o 
          LEFT JOIN users u ON o.user_id = u.id 
          WHERE o.id = ?
        `;
        break;

      case 'activity':
        query = `
          SELECT a.*, o.organization_name, o.contact_person, o.contact_phone 
          FROM activities a 
          LEFT JOIN organizations o ON a.organization_id = o.id 
          WHERE a.id = ?
        `;
        break;

      case 'application':
        query = `
          SELECT app.*, v.real_name, v.region, v.skills, v.interests, 
                 a.title as activity_title, a.description as activity_description,
                 u.phone_number, u.email
          FROM applications app 
          LEFT JOIN volunteers v ON app.volunteer_id = v.id 
          LEFT JOIN users u ON v.user_id = u.id
          LEFT JOIN activities a ON app.activity_id = a.id 
          WHERE app.id = ?
        `;
        break;

      case 'volunteer':
        query = `
          SELECT v.*, u.username, u.email, u.phone_number 
          FROM volunteers v 
          LEFT JOIN users u ON v.user_id = u.id 
          WHERE v.id = ?
        `;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: '无效的类型参数'
        }, { status: 400 });
    }

    const [rows] = await pool.execute(query, [id]);
    const data = (rows as any[])[0];

    if (!data) {
      return NextResponse.json({
        success: false,
        error: '未找到相关数据'
      }, { status: 404 });
    }

    // 处理JSON字段
    if (data.skills && typeof data.skills === 'string') {
      data.skills = JSON.parse(data.skills);
    }
    if (data.interests && typeof data.interests === 'string') {
      data.interests = JSON.parse(data.interests);
    }
    if (data.required_skills && typeof data.required_skills === 'string') {
      data.required_skills = JSON.parse(data.required_skills);
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('获取审核详情失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取审核详情失败'
    }, { status: 500 });
  }
}
