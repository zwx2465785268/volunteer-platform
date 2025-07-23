import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@/lib/database';

const pool = createPool();

// GET - 获取审核统计数据
export async function GET(request: NextRequest) {
  try {
    // 获取各类型待审核数量
    const pendingStatsQuery = `
      SELECT 
        'organization' as type,
        COUNT(*) as pending_count,
        0 as approved_count,
        0 as rejected_count
      FROM organizations 
      WHERE status = 'pending_review'
      
      UNION ALL
      
      SELECT 
        'activity' as type,
        COUNT(*) as pending_count,
        0 as approved_count,
        0 as rejected_count
      FROM activities 
      WHERE status = 'pending_review'
      
      UNION ALL
      
      SELECT 
        'application' as type,
        COUNT(*) as pending_count,
        0 as approved_count,
        0 as rejected_count
      FROM applications 
      WHERE status = 'pending'
      
      UNION ALL
      
      SELECT 
        'volunteer' as type,
        COUNT(*) as pending_count,
        0 as approved_count,
        0 as rejected_count
      FROM volunteers 
      WHERE verification_status = 'pending'
    `;

    // 获取各类型已审核数量
    const processedStatsQuery = `
      SELECT 
        'organization' as type,
        0 as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
      FROM organizations 
      WHERE status IN ('approved', 'rejected')
      
      UNION ALL
      
      SELECT 
        'activity' as type,
        0 as pending_count,
        SUM(CASE WHEN status = 'recruiting' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
      FROM activities 
      WHERE status IN ('recruiting', 'rejected', 'in_progress', 'completed')
      
      UNION ALL
      
      SELECT 
        'application' as type,
        0 as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
      FROM applications 
      WHERE status IN ('approved', 'rejected')
      
      UNION ALL
      
      SELECT 
        'volunteer' as type,
        0 as pending_count,
        SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
      FROM volunteers 
      WHERE verification_status IN ('verified', 'rejected')
    `;

    // 获取今日审核数量
    const todayStatsQuery = `
      SELECT 
        'organization' as type,
        COUNT(*) as today_count
      FROM organizations 
      WHERE DATE(updated_at) = CURDATE() AND status IN ('approved', 'rejected')
      
      UNION ALL
      
      SELECT 
        'activity' as type,
        COUNT(*) as today_count
      FROM activities 
      WHERE DATE(updated_at) = CURDATE() AND status IN ('recruiting', 'rejected')
      
      UNION ALL
      
      SELECT 
        'application' as type,
        COUNT(*) as today_count
      FROM applications 
      WHERE DATE(reviewed_at) = CURDATE() AND status IN ('approved', 'rejected')
      
      UNION ALL
      
      SELECT 
        'volunteer' as type,
        COUNT(*) as today_count
      FROM volunteers 
      WHERE DATE(updated_at) = CURDATE() AND verification_status IN ('verified', 'rejected')
    `;

    // 执行查询
    const [pendingStats] = await pool.execute(pendingStatsQuery);
    const [processedStats] = await pool.execute(processedStatsQuery);
    const [todayStats] = await pool.execute(todayStatsQuery);

    // 合并统计数据
    const statsMap = new Map();
    
    // 初始化数据结构
    ['organization', 'activity', 'application', 'volunteer'].forEach(type => {
      statsMap.set(type, {
        type,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        today_count: 0
      });
    });

    // 填充待审核数据
    (pendingStats as any[]).forEach(stat => {
      if (statsMap.has(stat.type)) {
        statsMap.get(stat.type).pending_count = stat.pending_count;
      }
    });

    // 填充已审核数据
    (processedStats as any[]).forEach(stat => {
      if (statsMap.has(stat.type)) {
        const existing = statsMap.get(stat.type);
        existing.approved_count += stat.approved_count;
        existing.rejected_count += stat.rejected_count;
      }
    });

    // 填充今日数据
    (todayStats as any[]).forEach(stat => {
      if (statsMap.has(stat.type)) {
        statsMap.get(stat.type).today_count = stat.today_count;
      }
    });

    // 转换为数组
    const stats = Array.from(statsMap.values());

    // 计算总计
    const totalStats = {
      total_pending: stats.reduce((sum, stat) => sum + stat.pending_count, 0),
      total_approved: stats.reduce((sum, stat) => sum + stat.approved_count, 0),
      total_rejected: stats.reduce((sum, stat) => sum + stat.rejected_count, 0),
      total_today: stats.reduce((sum, stat) => sum + stat.today_count, 0)
    };

    // 获取最近7天的审核趋势
    const trendQuery = `
      SELECT 
        DATE(updated_at) as review_date,
        'organization' as type,
        COUNT(*) as count
      FROM organizations 
      WHERE updated_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
        AND status IN ('approved', 'rejected')
      GROUP BY DATE(updated_at)
      
      UNION ALL
      
      SELECT 
        DATE(updated_at) as review_date,
        'activity' as type,
        COUNT(*) as count
      FROM activities 
      WHERE updated_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
        AND status IN ('recruiting', 'rejected')
      GROUP BY DATE(updated_at)
      
      UNION ALL
      
      SELECT 
        DATE(reviewed_at) as review_date,
        'application' as type,
        COUNT(*) as count
      FROM applications 
      WHERE reviewed_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
        AND status IN ('approved', 'rejected')
      GROUP BY DATE(reviewed_at)
      
      UNION ALL
      
      SELECT 
        DATE(updated_at) as review_date,
        'volunteer' as type,
        COUNT(*) as count
      FROM volunteers 
      WHERE updated_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
        AND verification_status IN ('verified', 'rejected')
      GROUP BY DATE(updated_at)
      
      ORDER BY review_date DESC
    `;

    const [trendData] = await pool.execute(trendQuery);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        totalStats,
        trend: trendData
      }
    });

  } catch (error) {
    console.error('获取审核统计失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取审核统计失败'
    }, { status: 500 });
  }
}
