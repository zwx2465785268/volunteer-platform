import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

// 审核项目接口
interface ReviewItem extends RowDataPacket {
  id: string;
  type: 'organization' | 'activity' | 'application' | 'volunteer';
  title: string;
  description?: string;
  applicant_name: string;
  applicant_contact?: string;
  status: string;
  created_at: string;
  updated_at: string;
  // 额外信息字段
  organization_name?: string;
  activity_title?: string;
  volunteer_name?: string;
  application_message?: string;
  unified_social_credit_code?: string;
  contact_person?: string;
  contact_phone?: string;
  real_name?: string;
  id_card_number?: string;
  region?: string;
}

const pool = createPool();

// GET - 获取审核列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // 组织审核查询
    const organizationQuery = `
      SELECT
        o.id,
        'organization' as type,
        o.organization_name as title,
        o.description,
        o.contact_person as applicant_name,
        o.contact_phone as applicant_contact,
        o.status,
        o.created_at,
        o.updated_at,
        o.unified_social_credit_code as extra1,
        o.contact_email as extra2,
        o.address as extra3,
        NULL as extra4,
        NULL as extra5
      FROM organizations o
      WHERE o.status = 'pending_review'
    `;

    // 活动审核查询
    const activityQuery = `
      SELECT
        a.id,
        'activity' as type,
        a.title,
        a.description,
        o.organization_name as applicant_name,
        o.contact_phone as applicant_contact,
        a.status,
        a.created_at,
        a.updated_at,
        a.location as extra1,
        a.start_time as extra2,
        a.end_time as extra3,
        a.required_volunteers as extra4,
        NULL as extra5
      FROM activities a
      LEFT JOIN organizations o ON a.organization_id = o.id
      WHERE a.status = 'pending_review'
    `;

    // 报名审核查询
    const applicationQuery = `
      SELECT
        app.id,
        'application' as type,
        CONCAT('报名申请 - ', a.title) as title,
        app.application_message as description,
        v.real_name as applicant_name,
        u.phone_number as applicant_contact,
        app.status,
        app.created_at,
        app.updated_at,
        a.title as extra1,
        v.real_name as extra2,
        app.application_message as extra3,
        NULL as extra4,
        NULL as extra5
      FROM applications app
      LEFT JOIN volunteers v ON app.volunteer_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN activities a ON app.activity_id = a.id
      WHERE app.status = 'pending'
    `;

    // 志愿者身份审核查询
    const volunteerQuery = `
      SELECT
        v.id,
        'volunteer' as type,
        CONCAT('志愿者身份认证 - ', v.real_name) as title,
        v.bio as description,
        v.real_name as applicant_name,
        u.phone_number as applicant_contact,
        v.verification_status as status,
        v.created_at,
        v.updated_at,
        v.id_card_number as extra1,
        v.region as extra2,
        v.skills as extra3,
        v.interests as extra4,
        NULL as extra5
      FROM volunteers v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.verification_status = 'pending'
    `;

    let finalQuery = '';
    let countQuery = '';

    // 根据状态筛选修改查询条件
    let orgStatusCondition = "o.status = 'pending_review'";
    let actStatusCondition = "a.status = 'pending_review'";
    let appStatusCondition = "app.status = 'pending'";
    let volStatusCondition = "v.verification_status = 'pending'";

    if (status) {
      switch (status) {
        case 'pending':
          // 保持默认的待审核条件
          break;
        case 'approved':
          orgStatusCondition = "o.status = 'approved'";
          actStatusCondition = "a.status = 'recruiting'";
          appStatusCondition = "app.status = 'approved'";
          volStatusCondition = "v.verification_status = 'verified'";
          break;
        case 'rejected':
          orgStatusCondition = "o.status = 'rejected'";
          actStatusCondition = "a.status = 'rejected'";
          appStatusCondition = "app.status = 'rejected'";
          volStatusCondition = "v.verification_status = 'rejected'";
          break;
      }
    }

    // 更新查询条件
    const updatedOrgQuery = organizationQuery.replace("WHERE o.status = 'pending_review'", `WHERE ${orgStatusCondition}`);
    const updatedActQuery = activityQuery.replace("WHERE a.status = 'pending_review'", `WHERE ${actStatusCondition}`);
    const updatedAppQuery = applicationQuery.replace("WHERE app.status = 'pending'", `WHERE ${appStatusCondition}`);
    const updatedVolQuery = volunteerQuery.replace("WHERE v.verification_status = 'pending'", `WHERE ${volStatusCondition}`);

    if (type) {
      // 根据类型筛选
      switch (type) {
        case 'organization':
          finalQuery = updatedOrgQuery;
          countQuery = `SELECT COUNT(*) as total FROM organizations o WHERE ${orgStatusCondition}`;
          break;
        case 'activity':
          finalQuery = updatedActQuery;
          countQuery = `SELECT COUNT(*) as total FROM activities a WHERE ${actStatusCondition}`;
          break;
        case 'application':
          finalQuery = updatedAppQuery;
          countQuery = `SELECT COUNT(*) as total FROM applications app WHERE ${appStatusCondition}`;
          break;
        case 'volunteer':
          finalQuery = updatedVolQuery;
          countQuery = `SELECT COUNT(*) as total FROM volunteers v WHERE ${volStatusCondition}`;
          break;
        default:
          finalQuery = `(${updatedOrgQuery}) UNION ALL (${updatedActQuery}) UNION ALL (${updatedAppQuery}) UNION ALL (${updatedVolQuery})`;
          countQuery = `
            SELECT SUM(cnt) as total FROM (
              SELECT COUNT(*) as cnt FROM organizations o WHERE ${orgStatusCondition}
              UNION ALL
              SELECT COUNT(*) as cnt FROM activities a WHERE ${actStatusCondition}
              UNION ALL
              SELECT COUNT(*) as cnt FROM applications app WHERE ${appStatusCondition}
              UNION ALL
              SELECT COUNT(*) as cnt FROM volunteers v WHERE ${volStatusCondition}
            ) as counts
          `;
      }
    } else {
      // 获取所有项目
      finalQuery = `(${updatedOrgQuery}) UNION ALL (${updatedActQuery}) UNION ALL (${updatedAppQuery}) UNION ALL (${updatedVolQuery})`;
      countQuery = `
        SELECT SUM(cnt) as total FROM (
          SELECT COUNT(*) as cnt FROM organizations o WHERE ${orgStatusCondition}
          UNION ALL
          SELECT COUNT(*) as cnt FROM activities a WHERE ${actStatusCondition}
          UNION ALL
          SELECT COUNT(*) as cnt FROM applications app WHERE ${appStatusCondition}
          UNION ALL
          SELECT COUNT(*) as cnt FROM volunteers v WHERE ${volStatusCondition}
        ) as counts
      `;
    }

    // 添加排序和分页
    finalQuery += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    console.log('执行审核查询:', { finalQuery, countQuery });

    // 执行查询
    const [reviews] = await pool.execute(finalQuery);
    const [countResult] = await pool.execute(countQuery);
    const total = (countResult as any[])[0].total || 0;

    // 处理数据格式
    const processedReviews = (reviews as ReviewItem[]).map(review => ({
      ...review,
      created_at: new Date(review.created_at).toISOString(),
      updated_at: new Date(review.updated_at).toISOString(),
      skills: review.type === 'volunteer' && review.skills ? 
        (typeof review.skills === 'string' ? JSON.parse(review.skills) : review.skills) : undefined,
      interests: review.type === 'volunteer' && review.interests ? 
        (typeof review.interests === 'string' ? JSON.parse(review.interests) : review.interests) : undefined
    }));

    return NextResponse.json({
      success: true,
      data: processedReviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('获取审核列表失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取审核列表失败'
    }, { status: 500 });
  }
}
