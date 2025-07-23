#!/usr/bin/env tsx

import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { createConnection } from '../lib/database';

// 加载环境变量
config({ path: '.env.local' });

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

async function promptForConfig(): Promise<DatabaseConfig> {
  console.log('📋 请输入数据库配置信息:\n');
  
  // 这里简化处理，实际项目中可以使用 inquirer 等库来做交互式输入
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'volunteer_platform'
  };
  
  console.log('当前配置:');
  console.log(`- 主机: ${config.host}`);
  console.log(`- 端口: ${config.port}`);
  console.log(`- 用户: ${config.user}`);
  console.log(`- 密码: ${config.password ? '***' : '(空)'}`);
  console.log(`- 数据库: ${config.database}`);
  console.log('');
  
  return config;
}

async function testConnectionWithConfig(config: DatabaseConfig): Promise<boolean> {
  try {
    // 设置临时环境变量
    process.env.DB_HOST = config.host;
    process.env.DB_PORT = config.port.toString();
    process.env.DB_USER = config.user;
    process.env.DB_PASSWORD = config.password;
    process.env.DB_NAME = config.database;
    
    // 测试连接（不指定数据库）
    const connection = await createConnection(false);
    await connection.ping();
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('连接失败:', error);
    return false;
  }
}

async function updateEnvFile(config: DatabaseConfig): Promise<void> {
  const envContent = `# 数据库配置 - 请根据您的实际情况修改
DB_HOST=${config.host}
DB_PORT=${config.port}
DB_USER=${config.user}
DB_PASSWORD=${config.password}
DB_NAME=${config.database}

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_that_should_be_at_least_32_characters_long_for_security
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=development
PORT=3000`;

  await fs.writeFile('.env.local', envContent, 'utf-8');
  console.log('✓ .env.local 文件已更新');
}

async function setupDatabase() {
  console.log('🚀 智能志愿者平台数据库设置\n');
  
  try {
    // 1. 获取配置
    const config = await promptForConfig();
    
    // 2. 测试连接
    console.log('🔍 测试数据库连接...');
    const connectionSuccess = await testConnectionWithConfig(config);
    
    if (!connectionSuccess) {
      console.log('\n❌ 数据库连接失败！');
      console.log('\n请检查以下事项:');
      console.log('1. MySQL服务是否已启动');
      console.log('2. 用户名和密码是否正确');
      console.log('3. 主机和端口是否正确');
      console.log('4. 用户是否有足够的权限');
      console.log('\n常见解决方案:');
      console.log('- 启动MySQL服务: net start mysql (Windows) 或 sudo service mysql start (Linux)');
      console.log('- 重置root密码: mysqladmin -u root password "新密码"');
      console.log('- 检查MySQL配置文件 my.cnf 或 my.ini');
      return;
    }
    
    console.log('✓ 数据库连接成功！');
    
    // 3. 更新环境变量文件
    await updateEnvFile(config);
    
    console.log('\n🎉 数据库配置完成！');
    console.log('\n下一步操作:');
    console.log('1. 运行 "pnpm run init-db" 创建数据库结构');
    console.log('2. 运行 "pnpm run init-db:seed" 创建数据库结构并插入测试数据');
    
  } catch (error) {
    console.error('❌ 设置过程中出现错误:', error);
  }
}

if (require.main === module) {
  setupDatabase().catch(console.error);
}
