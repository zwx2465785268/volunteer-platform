'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';

// 认证状态接口
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 认证操作接口
interface AuthActions {
  login: (data: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// 认证上下文类型
type AuthContextType = AuthState & AuthActions;

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件属性
interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供者组件
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 计算认证状态
  const isAuthenticated = !!user;

  // 初始化认证状态
  useEffect(() => {
    initializeAuth();
  }, []);

  // 初始化认证
  const initializeAuth = async () => {
    try {
      const token = apiClient.getToken();
      if (token) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // 清除无效token
      apiClient.setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
        apiClient.setToken(null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      apiClient.setToken(null);
    }
  };

  // 登录
  const login = async (data: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(data);
      console.log('AuthContext login response:', response);

      if (response.success && response.data?.user) {
        console.log('AuthContext setting user:', response.data.user);
        setUser(response.data.user);
        console.log('AuthContext user set successfully');
        return { success: true };
      } else {
        console.log('AuthContext login failed:', response.error);
        return {
          success: false,
          error: response.error?.message || '登录失败'
        };
      }
    } catch (error) {
      console.error('AuthContext login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '登录失败，请稍后重试'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 注册
  const register = async (data: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(data);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error?.message || '注册失败' 
        };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '注册失败，请稍后重试' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 登出
  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      apiClient.setToken(null);
      
      // 重定向到首页
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  // 上下文值
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证上下文的Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 检查用户权限的Hook
export function usePermission(requiredRoles: string[]) {
  const { user, isAuthenticated } = useAuth();
  
  const hasPermission = isAuthenticated && user && requiredRoles.includes(user.user_type);
  
  return { hasPermission, userType: user?.user_type };
}

// 导出认证上下文
export { AuthContext };
