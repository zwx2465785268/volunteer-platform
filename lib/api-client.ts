import { AuthResponse, LoginRequest, RegisterRequest, User } from './auth';

// API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// API客户端类
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;

    // 从localStorage获取token（仅在客户端）
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token') || this.getCookieToken();
    }
  }

  // 从cookie中获取token
  private getCookieToken(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-token') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  // 设置认证token
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth-token', token);
      } else {
        localStorage.removeItem('auth-token');
      }
    }
  }

  // 获取认证token
  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      // 尝试重新从localStorage或cookie获取token
      this.token = localStorage.getItem('auth-token') || this.getCookieToken();
    }
    return this.token;
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 添加认证头
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // 如果是401错误，清除token
      if (response.status === 401) {
        this.setToken(null);
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 认证相关API
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/register', data);
    
    // 注册成功后自动设置token
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', data);
    
    // 登录成功后自动设置token
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await this.post<{ success: boolean; message: string }>('/auth/logout');
    
    // 登出后清除token
    this.setToken(null);
    
    return response;
  }

  async getCurrentUser(): Promise<{ success: boolean; data?: { user: User } }> {
    return this.get<{ success: boolean; data?: { user: User } }>('/auth/me');
  }

  // 用户相关API
  async getUserProfile(userId: string): Promise<{ success: boolean; data?: { user: User } }> {
    return this.get<{ success: boolean; data?: { user: User } }>(`/users/${userId}`);
  }

  async updateUserProfile(userId: string, data: Partial<User>): Promise<{ success: boolean; data?: { user: User } }> {
    return this.put<{ success: boolean; data?: { user: User } }>(`/users/${userId}`, data);
  }
}

// 创建全局API客户端实例
export const apiClient = new ApiClient();

// 导出API客户端类
export default ApiClient;
