import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { createPool } from '@/lib/database';

// 获取活动推荐
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
    const limit = parseInt(searchParams.get('limit') || '10');

    const pool = createPool();

    // 2. 获取志愿者信息
    const [volunteerRows] = await pool.execute(`
      SELECT 
        v.id,
        v.region,
        v.skills,
        v.interests
      FROM volunteers v
      WHERE v.user_id = ?
    `, [payload.userId]);

    const volunteers = volunteerRows as any[];
    if (volunteers.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'VOLUNTEER_NOT_FOUND', message: '志愿者信息不存在' }
      }, { status: 404 });
    }

    const volunteer = volunteers[0];
    let volunteerSkills = [];
    let volunteerInterests = [];

    try {
      volunteerSkills = volunteer.skills ? JSON.parse(volunteer.skills) : [];
    } catch (e) {
      volunteerSkills = [];
    }

    try {
      volunteerInterests = volunteer.interests ? JSON.parse(volunteer.interests) : [];
    } catch (e) {
      volunteerInterests = [];
    }

    // 3. 获取已申请的活动ID
    const [appliedRows] = await pool.execute(`
      SELECT activity_id FROM applications WHERE volunteer_id = ?
    `, [volunteer.id]);

    const appliedActivityIds = (appliedRows as any[]).map(row => row.activity_id);
    const excludeClause = appliedActivityIds.length > 0 
      ? `AND a.id NOT IN (${appliedActivityIds.map(() => '?').join(',')})`
      : '';

    // 4. 获取推荐活动
    const queryParams = [
      volunteer.region || '',
      ...appliedActivityIds,
      limit
    ];

    const [activityRows] = await pool.execute(`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.category,
        a.start_time,
        a.end_time,
        a.location,
        a.required_volunteers,
        a.current_volunteers,
        a.required_skills,
        a.status,
        o.organization_name,
        o.contact_person,
        o.contact_phone,
        o.address as organization_address,
        -- 计算匹配度分数
        CASE 
          WHEN a.location LIKE CONCAT('%', ?, '%') THEN 10
          ELSE 0
        END as location_score
      FROM activities a
      LEFT JOIN organizations o ON a.organization_id = o.id
      WHERE a.status = 'published'
        AND a.start_time > NOW()
        AND a.current_volunteers < a.required_volunteers
        ${excludeClause}
      ORDER BY location_score DESC, a.start_time ASC
      LIMIT ?
    `, queryParams);

    // 5. 计算技能和兴趣匹配度
    const recommendations = (activityRows as any[]).map(row => {
      let requiredSkills = [];
      try {
        requiredSkills = row.required_skills ? JSON.parse(row.required_skills) : [];
      } catch (e) {
        requiredSkills = [];
      }

      // 计算技能匹配度
      const skillMatches = requiredSkills.filter(skill => 
        volunteerSkills.some(vSkill => 
          vSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(vSkill.toLowerCase())
        )
      );

      // 计算兴趣匹配度
      const interestMatches = volunteerInterests.filter(interest =>
        row.category.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(row.category.toLowerCase()) ||
        row.title.toLowerCase().includes(interest.toLowerCase()) ||
        row.description.toLowerCase().includes(interest.toLowerCase())
      );

      // 计算总匹配分数
      const skillScore = skillMatches.length * 20; // 每个匹配技能20分
      const interestScore = interestMatches.length * 15; // 每个匹配兴趣15分
      const locationScore = row.location_score; // 地区匹配10分
      const urgencyScore = row.required_volunteers - row.current_volunteers > 5 ? 5 : 0; // 急需志愿者5分

      const totalScore = skillScore + interestScore + locationScore + urgencyScore;

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        start_time: row.start_time,
        end_time: row.end_time,
        location: row.location,
        required_volunteers: row.required_volunteers,
        current_volunteers: row.current_volunteers,
        required_skills: requiredSkills,
        status: row.status,
        organization: {
          name: row.organization_name,
          contact_person: row.contact_person,
          contact_phone: row.contact_phone,
          address: row.organization_address
        },
        match_info: {
          total_score: totalScore,
          skill_matches: skillMatches,
          interest_matches: interestMatches,
          location_match: locationScore > 0,
          urgency_level: urgencyScore > 0 ? 'high' : 'normal'
        }
      };
    });

    // 6. 按匹配度排序
    recommendations.sort((a, b) => b.match_info.total_score - a.match_info.total_score);

    await pool.end();

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        volunteer_profile: {
          region: volunteer.region,
          skills: volunteerSkills,
          interests: volunteerInterests
        }
      }
    });

  } catch (error) {
    console.error('获取活动推荐失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '获取推荐失败' }
    }, { status: 500 });
  }
}
