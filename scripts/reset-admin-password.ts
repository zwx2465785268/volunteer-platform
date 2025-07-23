import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function resetAdminPassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'volunteer_platform'
  });

  try {
    // 新密码
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 重置平台管理员密码
    const [result] = await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE username = ? AND user_type = ?',
      [hashedPassword, 'admin', 'platform_admin']
    );

    const updateResult = result as any;
    
    if (updateResult.affectedRows > 0) {
      console.log('✅ 管理员密码重置成功！');
      console.log('');
      console.log('📋 管理员登录信息：');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
      console.log('   权限: platform_admin (平台管理员)');
      console.log('');
      console.log('🔗 登录地址: http://localhost:3000/login');
      console.log('🔗 管理后台: http://localhost:3000/admin');
      console.log('');
      console.log('💡 登录后可以访问：');
      console.log('   - 用户管理');
      console.log('   - 活动管理');
      console.log('   - 系统设置');
      console.log('   - 数据统计');
    } else {
      console.log('❌ 没有找到平台管理员账号');
    }

  } catch (error) {
    console.error('❌ 重置密码失败:', error);
  } finally {
    await connection.end();
  }
}

resetAdminPassword();
