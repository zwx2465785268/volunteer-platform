import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

// 数据库配置接口
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

// 从环境变量获取数据库配置
function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zyz'
  };
}

// 创建数据库连接
export async function createConnection(includeDatabase = true) {
  const config = getDatabaseConfig();
  
  if (!includeDatabase) {
    // 不指定数据库，用于创建数据库
    const { database, ...configWithoutDb } = config;
    return mysql.createConnection(configWithoutDb);
  }
  
  return mysql.createConnection(config);
}

// 创建数据库连接池
export function createPool() {
  const config = getDatabaseConfig();
  
  return mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
  });
}

// 执行SQL文件
export async function executeSqlFile(filePath: string, connection?: mysql.Connection) {
  try {
    const fullPath = path.resolve(filePath);
    const sqlContent = await fs.readFile(fullPath, 'utf-8');
    
    // 分割SQL语句（按分号分割，但要考虑存储过程中的分号）
    const statements = splitSqlStatements(sqlContent);
    
    const conn = connection || await createConnection();
    
    console.log(`开始执行SQL文件: ${filePath}`);
    console.log(`共找到 ${statements.length} 条SQL语句`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith('--')) {
        try {
          console.log(`执行第 ${i + 1} 条语句...`);
          await conn.query(statement);
          console.log(`✓ 第 ${i + 1} 条语句执行成功`);
        } catch (error) {
          console.error(`✗ 第 ${i + 1} 条语句执行失败:`, error);
          console.error(`语句内容: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }
    
    if (!connection) {
      await conn.end();
    }
    
    console.log(`✓ SQL文件执行完成: ${filePath}`);
  } catch (error) {
    console.error(`执行SQL文件失败: ${filePath}`, error);
    throw error;
  }
}

// 分割SQL语句的辅助函数
function splitSqlStatements(sqlContent: string): string[] {
  const statements: string[] = [];
  let currentStatement = '';
  let inDelimiter = false;
  let delimiterKeyword = '';
  
  const lines = sqlContent.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 跳过注释行
    if (trimmedLine.startsWith('--') || trimmedLine.startsWith('#')) {
      continue;
    }
    
    // 检查DELIMITER关键字
    if (trimmedLine.toUpperCase().startsWith('DELIMITER')) {
      const parts = trimmedLine.split(/\s+/);
      if (parts.length > 1) {
        delimiterKeyword = parts[1];
        inDelimiter = true;
        continue;
      }
    }
    
    currentStatement += line + '\n';
    
    // 检查语句结束
    if (inDelimiter) {
      if (trimmedLine === delimiterKeyword) {
        inDelimiter = false;
        delimiterKeyword = '';
        continue;
      }
      if (trimmedLine.endsWith(delimiterKeyword)) {
        // 移除delimiter并添加语句
        currentStatement = currentStatement.replace(new RegExp(delimiterKeyword + '\\s*$'), '');
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    } else {
      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
  }
  
  // 添加最后一个语句（如果有）
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements.filter(stmt => stmt.length > 0);
}

// 检查数据库是否存在
export async function checkDatabaseExists(databaseName: string): Promise<boolean> {
  const connection = await createConnection(false);
  
  try {
    const [rows] = await connection.execute(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [databaseName]
    );
    
    return Array.isArray(rows) && rows.length > 0;
  } finally {
    await connection.end();
  }
}

// 创建数据库
export async function createDatabase(databaseName: string): Promise<void> {
  const connection = await createConnection(false);
  
  try {
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    console.log(`✓ 数据库 ${databaseName} 创建成功`);
  } finally {
    await connection.end();
  }
}

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await createConnection();
    await connection.ping();
    await connection.end();
    console.log('✓ 数据库连接测试成功');
    return true;
  } catch (error) {
    console.error('✗ 数据库连接测试失败:', error);
    return false;
  }
}
