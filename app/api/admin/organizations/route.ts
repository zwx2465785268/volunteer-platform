import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

// 组织数据接口
interface Organization extends RowDataPacket {
  id: string;
  user_id: string;
  organization_name: string;
  unified_social_credit_code: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  description: string;
  status: 'approved' | 'pending_review' | 'rejected';
  created_at: string;
  updated_at: string;
}

const pool = createPool();

// GET - 获取组织列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const simple = searchParams.get('simple') === 'true'; // 简化模式，只返回id和name

    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereConditions = ['1=1'];
    let queryParams: any[] = [];

    if (search) {
      whereConditions.push('(organization_name LIKE ? OR contact_person LIKE ? OR contact_email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereConditions.push('status = ?');
      queryParams.push(status);
    } else {
      // 默认只显示已审核通过的组织
      whereConditions.push('status = ?');
      queryParams.push('approved');
    }

    const whereClause = whereConditions.join(' AND ');

    // 根据模式选择查询字段
    const selectFields = simple 
      ? 'id, organization_name'
      : '*';

    // 查询组织列表
    const organizationsQuery = `
      SELECT ${selectFields}
      FROM organizations
      WHERE ${whereClause}
      ORDER BY organization_name ASC
      ${simple ? '' : 'LIMIT ? OFFSET ?'}
    `;

    const queryParamsWithPagination = simple 
      ? queryParams 
      : [...queryParams, limit, offset];

    console.log('执行组织查询:', {
      queryParams: queryParamsWithPagination,
      limit: simple ? 'unlimited' : limit,
      offset: simple ? 'none' : offset,
      finalQuery: organizationsQuery
    });

    const [organizations] = await pool.execute(organizationsQuery, queryParamsWithPagination);

    // 如果是简化模式，直接返回
    if (simple) {
      return NextResponse.json({
        success: true,
        data: organizations
      });
    }

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM organizations
      WHERE ${whereClause}
    `;

    console.log('执行计数查询:', { queryParams });

    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = (countResult as any[])[0].total;

    // 处理组织数据
    const processedOrganizations = (organizations as Organization[]).map(org => ({
      ...org,
      created_at: new Date(org.created_at).toISOString(),
      updated_at: new Date(org.updated_at).toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: processedOrganizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取组织列表失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取组织列表失败'
    }, { status: 500 });
  }
}

// POST - 创建新组织
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      organization_name,
      unified_social_credit_code,
      contact_person,
      contact_phone,
      contact_email,
      address,
      description,
      status = 'pending_review'
    } = body;

    // 验证必填字段
    if (!user_id || !organization_name || !unified_social_credit_code || !contact_person || !contact_phone || !contact_email) {
      return NextResponse.json({
        success: false,
        error: '请填写所有必填字段'
      }, { status: 400 });
    }

    // 检查组织名称是否已存在
    const [existingOrgs] = await pool.execute(
      'SELECT id FROM organizations WHERE organization_name = ? OR unified_social_credit_code = ?',
      [organization_name, unified_social_credit_code]
    );

    if ((existingOrgs as any[]).length > 0) {
      return NextResponse.json({
        success: false,
        error: '组织名称或统一社会信用代码已存在'
      }, { status: 400 });
    }

    // 插入新组织
    const insertQuery = `
      INSERT INTO organizations (
        user_id, organization_name, unified_social_credit_code, contact_person,
        contact_phone, contact_email, address, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(insertQuery, [
      user_id,
      organization_name,
      unified_social_credit_code,
      contact_person,
      contact_phone,
      contact_email,
      address || null,
      description || null,
      status
    ]);

    const insertId = (result as any).insertId;

    // 获取创建的组织详情
    const [newOrganization] = await pool.execute(
      'SELECT * FROM organizations WHERE id = ?',
      [insertId]
    );

    const organization = (newOrganization as Organization[])[0];
    const processedOrganization = {
      ...organization,
      created_at: new Date(organization.created_at).toISOString(),
      updated_at: new Date(organization.updated_at).toISOString()
    };

    return NextResponse.json({
      success: true,
      data: processedOrganization,
      message: '组织创建成功'
    });

  } catch (error) {
    console.error('创建组织失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建组织失败'
    }, { status: 500 });
  }
}
