import { createPool } from '../database';
import { User, RegisterRequest, UserType, UserStatus } from '../auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 数据库连接池
const pool = createPool();

// 数据库用户接口（包含密码哈希）
interface DbUser extends RowDataPacket {
  id: string;
  username: string;
  password_hash: string;
  email: string;
  phone_number: string;
  user_type: UserType;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

/**
 * 根据ID查找用户
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const [rows] = await pool.execute<DbUser[]>(
      'SELECT id, username, email, phone_number, user_type, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw new Error('数据库查询失败');
  }
}

/**
 * 根据用户名查找用户（包含密码哈希）
 */
export async function findUserByUsername(username: string): Promise<DbUser | null> {
  try {
    const [rows] = await pool.execute<DbUser[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw new Error('数据库查询失败');
  }
}

/**
 * 根据邮箱查找用户（包含密码哈希）
 */
export async function findUserByEmail(email: string): Promise<DbUser | null> {
  try {
    const [rows] = await pool.execute<DbUser[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw new Error('数据库查询失败');
  }
}

/**
 * 根据手机号查找用户（包含密码哈希）
 */
export async function findUserByPhone(phone: string): Promise<DbUser | null> {
  try {
    const [rows] = await pool.execute<DbUser[]>(
      'SELECT * FROM users WHERE phone_number = ?',
      [phone]
    );
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by phone:', error);
    throw new Error('数据库查询失败');
  }
}

/**
 * 根据标识符查找用户（用户名、邮箱或手机号）
 */
export async function findUserByIdentifier(identifier: string): Promise<DbUser | null> {
  try {
    const [rows] = await pool.execute<DbUser[]>(
      'SELECT * FROM users WHERE username = ? OR email = ? OR phone_number = ?',
      [identifier, identifier, identifier]
    );
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by identifier:', error);
    throw new Error('数据库查询失败');
  }
}

/**
 * 检查用户名是否已存在
 */
export async function isUsernameExists(username: string): Promise<boolean> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE username = ?',
      [username]
    );
    
    return rows[0].count > 0;
  } catch (error) {
    console.error('Error checking username existence:', error);
    throw new Error('数据库查询失败');
  }
}

/**
 * 检查邮箱是否已存在
 */
export async function isEmailExists(email: string): Promise<boolean> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      [email]
    );
    
    return rows[0].count > 0;
  } catch (error) {
    console.error('Error checking email existence:', error);
    throw new Error('数据库查询失败');
  }
}

/**
 * 检查手机号是否已存在
 */
export async function isPhoneExists(phone: string): Promise<boolean> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE phone_number = ?',
      [phone]
    );
    
    return rows[0].count > 0;
  } catch (error) {
    console.error('Error checking phone existence:', error);
    throw new Error('数据库查询失败');
  }
}

/**
 * 创建新用户
 */
export async function createUser(userData: RegisterRequest & { password_hash: string }): Promise<User> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 生成用户ID
    const userId = crypto.randomUUID();
    
    // 插入用户基础信息
    await connection.execute<ResultSetHeader>(
      `INSERT INTO users (id, username, password_hash, email, phone_number, user_type, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [userId, userData.username, userData.password_hash, userData.email, userData.phone_number, userData.user_type]
    );
    
    // 如果是志愿者，创建志愿者详细信息记录
    if (userData.user_type === 'volunteer') {
      await connection.execute<ResultSetHeader>(
        `INSERT INTO volunteers (id, user_id, real_name, verification_status) 
         VALUES (?, ?, ?, 'pending')`,
        [crypto.randomUUID(), userId, userData.username]
      );
    }
    
    // 如果是组织管理员，创建组织信息记录（待完善）
    if (userData.user_type === 'organization_admin') {
      await connection.execute<ResultSetHeader>(
        `INSERT INTO organizations (id, user_id, organization_name, unified_social_credit_code, contact_person, contact_phone, contact_email, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_review')`,
        [crypto.randomUUID(), userId, '待完善', '待完善', userData.username, userData.phone_number, userData.email]
      );
    }
    
    await connection.commit();
    
    // 返回创建的用户信息（不包含密码）
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('用户创建失败');
    }
    
    return user;
    
  } catch (error) {
    await connection.rollback();
    console.error('Error creating user:', error);
    throw new Error('用户创建失败');
  } finally {
    connection.release();
  }
}

/**
 * 更新用户状态
 */
export async function updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('用户状态更新失败');
  }
}

/**
 * 更新用户密码
 */
export async function updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw new Error('密码更新失败');
  }
}

/**
 * 获取用户统计信息
 */
export async function getUserStats(): Promise<{
  totalUsers: number;
  volunteers: number;
  organizations: number;
  admins: number;
}> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN user_type = 'volunteer' THEN 1 ELSE 0 END) as volunteers,
        SUM(CASE WHEN user_type = 'organization_admin' THEN 1 ELSE 0 END) as organizations,
        SUM(CASE WHEN user_type = 'platform_admin' THEN 1 ELSE 0 END) as admins
       FROM users`
    );
    
    const stats = rows[0];
    return {
      totalUsers: stats.total_users,
      volunteers: stats.volunteers,
      organizations: stats.organizations,
      admins: stats.admins
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new Error('获取用户统计失败');
  }
}
