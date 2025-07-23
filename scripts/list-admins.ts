import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listAdmins() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'volunteer_platform'
  });

  try {
    // 查询所有管理员账号
    const [rows] = await connection.execute(
      `SELECT id, username, email, phone_number, user_type, status, created_at 
       FROM users 
       WHERE user_type IN ('platform_admin', 'organization_admin')
       ORDER BY user_type, created_at`
    );

    const admins = rows as any[];

    if (admins.length === 0) {
      console.log('❌ 没有找到管理员账号');
      return;
    }

    console.log('📋 现有管理员账号：');
    console.log('');

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. 用户名: ${admin.username}`);
      console.log(`   邮箱: ${admin.email}`);
      console.log(`   手机: ${admin.phone_number}`);
      console.log(`   权限: ${admin.user_type}`);
      console.log(`   状态: ${admin.status}`);
      console.log(`   创建时间: ${admin.created_at}`);
      console.log('');
    });

    console.log('💡 提示：');
    console.log('   - platform_admin: 平台管理员（最高权限）');
    console.log('   - organization_admin: 机构管理员');
    console.log('');
    console.log('🔗 登录地址: http://localhost:3000/login');
    console.log('🔗 管理后台: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await connection.end();
  }
}

listAdmins();
