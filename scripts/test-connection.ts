#!/usr/bin/env tsx

import { config } from 'dotenv';
import { testConnection, createConnection } from '../lib/database';

// 加载环境变量
config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('🔍 测试数据库连接...\n');
  
  console.log('数据库配置:');
  console.log(`- 主机: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`- 端口: ${process.env.DB_PORT || '3306'}`);
  console.log(`- 用户: ${process.env.DB_USER || 'root'}`);
  console.log(`- 数据库: ${process.env.DB_NAME || 'volunteer_platform'}`);
  console.log('');
  
  try {
    // 测试连接（不指定数据库）
    console.log('1. 测试基础连接...');
    const connection = await createConnection(false);
    await connection.ping();
    console.log('✓ 基础连接成功');
    
    // 查询MySQL版本
    const [rows] = await connection.execute('SELECT VERSION() as version');
    const version = Array.isArray(rows) && rows.length > 0 ? (rows[0] as any).version : 'Unknown';
    console.log(`✓ MySQL版本: ${version}`);
    
    await connection.end();
    
    // 测试完整连接（包含数据库）
    console.log('\n2. 测试数据库连接...');
    const success = await testConnection();
    
    if (success) {
      console.log('\n🎉 数据库连接测试成功！可以开始初始化数据库。');
    } else {
      console.log('\n❌ 数据库连接失败，请检查配置。');
    }
    
  } catch (error) {
    console.error('\n❌ 连接测试失败:', error);
    console.log('\n请检查以下配置:');
    console.log('1. MySQL服务是否已启动');
    console.log('2. 数据库连接信息是否正确');
    console.log('3. 用户权限是否足够');
    console.log('4. 防火墙是否阻止连接');
  }
}

if (require.main === module) {
  testDatabaseConnection().catch(console.error);
}
