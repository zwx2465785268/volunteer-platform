import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'volunteer_platform'
  });

  try {
    // 管理员账号信息
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      phone_number: '13800000000',
      user_type: 'platform_admin' as const,
      status: 'active' as const
    };

    // 检查是否已存在
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [adminData.username, adminData.email]
    );

    if ((existing as any[]).length > 0) {
      console.log('❌ 管理员账号已存在');
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // 插入管理员用户
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password_hash, phone_number, user_type, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        adminData.username,
        adminData.email,
        hashedPassword,
        adminData.phone_number,
        adminData.user_type,
        adminData.status
      ]
    );

    console.log('✅ 管理员账号创建成功！');
    console.log('📋 登录信息：');
    console.log(`   用户名: ${adminData.username}`);
    console.log(`   密码: ${adminData.password}`);
    console.log(`   邮箱: ${adminData.email}`);
    console.log(`   权限: ${adminData.user_type}`);
    console.log('');
    console.log('🔗 管理员登录地址: http://localhost:3000/login');
    console.log('🔗 管理员后台地址: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ 创建管理员账号失败:', error);
  } finally {
    await connection.end();
  }
}

createAdmin();
