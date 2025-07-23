#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import {
  createConnection,
  executeSqlFile,
  checkDatabaseExists,
  createDatabase,
  testConnection
} from '../lib/database';

// 加载环境变量
config({ path: '.env.local' });

async function initDatabase() {
  console.log('🚀 开始初始化数据库...\n');
  
  try {
    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...');
    const connectionTest = await testConnection();
    if (!connectionTest) {
      console.error('❌ 数据库连接失败，请检查配置');
      process.exit(1);
    }
    console.log('');
    
    // 2. 检查并创建数据库
    const databaseName = process.env.DB_NAME || 'volunteer_platform';
    console.log(`2. 检查数据库 ${databaseName}...`);
    
    const dbExists = await checkDatabaseExists(databaseName);
    if (!dbExists) {
      console.log(`数据库 ${databaseName} 不存在，正在创建...`);
      await createDatabase(databaseName);
    } else {
      console.log(`✓ 数据库 ${databaseName} 已存在`);
    }
    console.log('');
    
    // 3. 执行建表脚本
    console.log('3. 执行数据库结构创建脚本...');
    const createTableScript = path.join(__dirname, 'create-database.sql');
    await executeSqlFile(createTableScript);
    console.log('');
    
    // 4. 询问是否插入测试数据
    const shouldSeedData = process.argv.includes('--seed') || process.argv.includes('-s');
    
    if (shouldSeedData) {
      console.log('4. 插入测试数据...');
      const seedDataScript = path.join(__dirname, 'seed-data.sql');
      await executeSqlFile(seedDataScript);
      console.log('');
    } else {
      console.log('4. 跳过测试数据插入（使用 --seed 参数可插入测试数据）');
      console.log('');
    }
    
    console.log('🎉 数据库初始化完成！');
    console.log('\n数据库信息:');
    console.log(`- 主机: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`- 端口: ${process.env.DB_PORT || '3306'}`);
    console.log(`- 数据库: ${databaseName}`);
    console.log(`- 用户: ${process.env.DB_USER || 'root'}`);
    
    if (shouldSeedData) {
      console.log('\n测试账户信息:');
      console.log('- 平台管理员: admin / password (需要设置真实密码)');
      console.log('- 组织管理员: green_home / password');
      console.log('- 志愿者: zhangxiaoming / password');
    }
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
数据库初始化脚本

用法:
  npm run init-db              # 仅创建数据库结构
  npm run init-db --seed       # 创建数据库结构并插入测试数据
  npm run init-db -s           # 同上（简写）

环境变量:
  DB_HOST      数据库主机 (默认: localhost)
  DB_PORT      数据库端口 (默认: 3306)
  DB_USER      数据库用户 (默认: root)
  DB_PASSWORD  数据库密码
  DB_NAME      数据库名称 (默认: volunteer_platform)

示例:
  DB_HOST=localhost DB_USER=root DB_PASSWORD=123456 npm run init-db --seed
  `);
}

// 主函数
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    return;
  }
  
  await initDatabase();
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

export { initDatabase };
