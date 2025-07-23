import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_that_should_be_at_least_32_characters_long_for_security';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 用户类型
export type UserType = 'volunteer' | 'organization_admin' | 'platform_admin';
export type UserStatus = 'active' | 'inactive' | 'pending_verification';

// JWT载荷接口
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  userType: UserType;
  status: UserStatus;
  iat?: number;
  exp?: number;
}

// 用户信息接口
export interface User {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  user_type: UserType;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

// 注册请求接口
export interface RegisterRequest {
  username: string;
  email: string;
  phone_number: string;
  password: string;
  user_type: UserType;
}

// 登录请求接口
export interface LoginRequest {
  identifier: string; // 可以是用户名、邮箱或手机号
  password: string;
}

// 认证响应接口
export interface AuthResponse {
  success: boolean;
  data?: {
    user: Omit<User, 'password_hash'>;
    token: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 生成JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * 从请求中提取token
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // 从Authorization header中提取
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 从cookie中提取（可选）
  const tokenFromCookie = request.cookies.get('auth-token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }
  
  return null;
}

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 验证用户权限
 */
export function hasPermission(userType: UserType, requiredPermissions: UserType[]): boolean {
  return requiredPermissions.includes(userType);
}

/**
 * 检查用户状态是否有效
 */
export function isUserActive(status: UserStatus): boolean {
  return status === 'active';
}

/**
 * 生成用户ID（UUID）
 */
export function generateUserId(): string {
  return crypto.randomUUID();
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码强度
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: '密码必须包含小写字母' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: '密码必须包含大写字母' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: '密码必须包含数字' };
  }
  
  return { valid: true };
}

/**
 * 验证用户名格式
 */
export function isValidUsername(username: string): { valid: boolean; message?: string } {
  if (username.length < 3 || username.length > 50) {
    return { valid: false, message: '用户名长度必须在3-50个字符之间' };
  }
  
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线和中文字符' };
  }
  
  return { valid: true };
}
