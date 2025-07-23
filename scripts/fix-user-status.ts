#!/usr/bin/env tsx

import { config } from 'dotenv';
import { createPool } from '../lib/database';
import { ResultSetHeader } from 'mysql2';

// 加载环境变量
config({ path: '.env.local' });

async function fixUserStatus() {
  const pool = createPool();
  
  try {
    console.log('🔧 开始修复用户状态...\n');
    
    // 查询所有待验证的用户
    const [pendingUsers] = await pool.execute(
      'SELECT id, username, email FROM users WHERE status = ?',
      ['pending_verification']
    );
    
    console.log(`找到 ${Array.isArray(pendingUsers) ? pendingUsers.length : 0} 个待验证用户`);
    
    if (Array.isArray(pendingUsers) && pendingUsers.length > 0) {
      // 更新所有待验证用户为激活状态
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE users SET status = ? WHERE status = ?',
        ['active', 'pending_verification']
      );
      
      console.log(`✅ 成功激活 ${result.affectedRows} 个用户账户`);
      
      // 显示更新的用户列表
      console.log('\n已激活的用户:');
      pendingUsers.forEach((user: any, index: number) => {
        console.log(`${index + 1}. ${user.username} (${user.email})`);
      });
    } else {
      console.log('✅ 没有需要修复的用户');
    }
    
    console.log('\n🎉 用户状态修复完成！');
    
  } catch (error) {
    console.error('❌ 修复用户状态失败:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  fixUserStatus().catch(console.error);
}
