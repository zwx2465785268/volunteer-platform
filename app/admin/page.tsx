'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AIAssistant from '@/components/AIAssistant'

interface User {
  id: number
  username: string
  email: string
  user_type: string
  status: string
}

type ActiveTab = 'dashboard' | 'users' | 'activities' | 'reviews' | 'settings' | 'ai-assistant'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const result = await response.json()

      if (result.success && result.data?.user) {
        const userData = result.data.user
        
        // 检查是否是管理员
        if (userData.user_type === 'platform_admin' || userData.user_type === 'organization_admin') {
          setUser(userData)
        } else {
          // 不是管理员，重定向到普通用户仪表板
          router.push('/dashboard')
          return
        }
      } else {
        // 未登录，重定向到登录页
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('认证检查失败:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 重定向中
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* 统计卡片 - 美化版本 */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-blue-100 truncate">
                          总用户数
                        </dt>
                        <dd className="text-2xl font-bold text-white">
                          1,234
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-green-100 truncate">
                          活动总数
                        </dt>
                        <dd className="text-2xl font-bold text-white">
                          56
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-orange-100 truncate">
                          待审核
                        </dt>
                        <dd className="text-2xl font-bold text-white">
                          12
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-purple-100 truncate">
                          总志愿时长
                        </dt>
                        <dd className="text-2xl font-bold text-white">
                          2,456h
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 最近活动 */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    最近活动
                  </h3>
                  <span className="text-sm text-gray-500">查看全部</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">张三</span> 报名了活动 <span className="font-medium">社区清洁活动</span>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">2分钟前</div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">李四</span> 完成了活动 <span className="font-medium">敬老院志愿服务</span>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">5分钟前</div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <div className="text-sm text-gray-600">
                      新活动 <span className="font-medium">环保宣传活动</span> 等待审核
                    </div>
                    <div className="ml-auto text-xs text-gray-400">10分钟前</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'users':
        return <UserManagement />
      case 'activities':
        return <ActivitiesManagement />
      case 'reviews':
        return <ReviewsManagement />
      case 'settings':
        return (
          <div className="bg-white shadow-lg rounded-xl border border-gray-100">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  系统设置
                </h3>
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm">
                  保存设置
                </button>
              </div>
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 mb-2">系统设置功能正在开发中</p>
                <p className="text-sm text-gray-400">即将为您提供完整的系统设置功能</p>
              </div>
            </div>
          </div>
        )
      case 'ai-assistant':
        return <AIAssistant />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* 顶部导航栏 - 美化版本 */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  志愿者后台管理面板
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {user.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user.user_type === 'platform_admin' ? '平台管理员' : '机构管理员'}
                  </span>
                </div>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-red-50/80 backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex relative z-10">
        {/* 侧边栏 - Element UI 风格 */}
        <div className="w-64 bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-md min-h-screen shadow-2xl border-r border-white/10 relative">
          {/* 侧边栏背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-purple-600/10 pointer-events-none"></div>
          <div className="absolute top-20 left-4 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-20 right-4 w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 py-6">
            {/* Logo 区域 */}
            <div className="px-6 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-white font-semibold text-lg">志愿管理</span>
              </div>
            </div>

            <nav className="space-y-2 px-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center space-x-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>仪表板</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center space-x-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>用户管理</span>
              </button>

              <button
                onClick={() => setActiveTab('activities')}
                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center space-x-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'activities'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>活动管理</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center space-x-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'reviews'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>审核管理</span>
                {activeTab === 'reviews' && (
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">12</span>
                )}
              </button>

              <div className="border-t border-slate-700 my-4"></div>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center space-x-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>系统设置</span>
              </button>

              <button
                onClick={() => setActiveTab('ai-assistant')}
                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center space-x-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'ai-assistant'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI助手</span>
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* 主要内容区域 */}
        <main className="flex-1 p-6 bg-gradient-to-br from-slate-50/50 via-white/80 to-blue-50/50 backdrop-blur-sm min-h-screen relative">
          {/* 主内容区背景装饰 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 left-20 w-48 h-48 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-2xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

// 用户管理组件
function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        userType: userTypeFilter,
        status: statusFilter
      })

      const token = localStorage.getItem('token')
      console.log('Token from localStorage:', token)

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response status:', response.status)
      const responseText = await response.text()
      console.log('Response text:', responseText)

      if (response.ok) {
        const data = JSON.parse(responseText)
        console.log('Parsed data:', data)
        setUsers(data.data.users)
        setTotalPages(data.data.pagination.totalPages)
      } else {
        console.error('获取用户列表失败:', responseText)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, userTypeFilter, statusFilter])

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        alert('用户删除成功')
        fetchUsers()
      } else {
        alert('删除用户失败')
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      alert('删除用户失败')
    }
  }

  // 用户类型显示名称
  const getUserTypeName = (type: string) => {
    switch (type) {
      case 'volunteer': return '志愿者'
      case 'organization_admin': return '机构管理员'
      case 'platform_admin': return '平台管理员'
      default: return type
    }
  }

  // 状态显示名称
  const getStatusName = (status: string) => {
    switch (status) {
      case 'active': return '活跃'
      case 'inactive': return '非活跃'
      case 'pending_verification': return '待验证'
      default: return status
    }
  }

  // 状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100">
      <div className="px-6 py-5">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            用户管理
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>添加用户</span>
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="搜索用户名、邮箱或手机号"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">所有用户类型</option>
              <option value="volunteer">志愿者</option>
              <option value="organization_admin">机构管理员</option>
              <option value="platform_admin">平台管理员</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">所有状态</option>
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
              <option value="pending_verification">待验证</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => {
                setSearchTerm('')
                setUserTypeFilter('')
                setStatusFilter('')
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              重置筛选
            </button>
          </div>
        </div>

        {/* 用户列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-gray-500 mb-2">暂无用户数据</p>
            <p className="text-sm text-gray-400">尝试调整搜索条件或添加新用户</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      联系方式
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      注册时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                            </div>
                            {user.real_name && (
                              <div className="text-sm text-gray-500">
                                {user.real_name}
                              </div>
                            )}
                            {user.organization_name && (
                              <div className="text-sm text-gray-500">
                                {user.organization_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {getUserTypeName(user.user_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                          {getStatusName(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowEditModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  第 {currentPage} 页，共 {totalPages} 页
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 添加用户模态框 */}
        {showAddModal && (
          <AddUserModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              fetchUsers()
            }}
          />
        )}

        {/* 编辑用户模态框 */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false)
              setSelectedUser(null)
            }}
            onSuccess={() => {
              setShowEditModal(false)
              setSelectedUser(null)
              fetchUsers()
            }}
          />
        )}
      </div>
    </div>
  )
}

// 添加用户模态框组件
function AddUserModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: '',
    user_type: 'volunteer' as 'volunteer' | 'organization_admin' | 'platform_admin',
    real_name: '',
    organization_name: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('用户创建成功')
        onSuccess()
      } else {
        const error = await response.json()
        alert(`创建用户失败: ${error.error}`)
      }
    } catch (error) {
      console.error('创建用户失败:', error)
      alert('创建用户失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">添加用户</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户类型</label>
            <select
              value={formData.user_type}
              onChange={(e) => setFormData({...formData, user_type: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="volunteer">志愿者</option>
              <option value="organization_admin">机构管理员</option>
              <option value="platform_admin">平台管理员</option>
            </select>
          </div>

          {formData.user_type === 'volunteer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">真实姓名</label>
              <input
                type="text"
                value={formData.real_name}
                onChange={(e) => setFormData({...formData, real_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {formData.user_type === 'organization_admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">组织名称</label>
              <input
                type="text"
                value={formData.organization_name}
                onChange={(e) => setFormData({...formData, organization_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建用户'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 编辑用户模态框组件
function EditUserModal({ user, onClose, onSuccess }: { user: any, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    phone_number: user.phone_number || '',
    status: user.status || 'active',
    real_name: user.real_name || '',
    organization_name: user.organization_name || '',
    verification_status: user.verification_status || 'pending'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('用户信息更新成功')
        onSuccess()
      } else {
        const error = await response.json()
        alert(`更新用户失败: ${error.error}`)
      }
    } catch (error) {
      console.error('更新用户失败:', error)
      alert('更新用户失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">编辑用户</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
              <option value="pending_verification">待验证</option>
            </select>
          </div>

          {user.user_type === 'volunteer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">真实姓名</label>
                <input
                  type="text"
                  value={formData.real_name}
                  onChange={(e) => setFormData({...formData, real_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">验证状态</label>
                <select
                  value={formData.verification_status}
                  onChange={(e) => setFormData({...formData, verification_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">待验证</option>
                  <option value="verified">已验证</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>
            </>
          )}

          {user.user_type === 'organization_admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">组织名称</label>
              <input
                type="text"
                value={formData.organization_name}
                onChange={(e) => setFormData({...formData, organization_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? '更新中...' : '更新用户'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 活动管理组件
function ActivitiesManagement() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  // 获取活动列表
  const fetchActivities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter
      })

      const response = await fetch(`/api/admin/activities?${params}`)
      const data = await response.json()

      if (data.success) {
        setActivities(data.data)
        setTotalPages(Math.ceil(data.total / 10))
      }
    } catch (error) {
      console.error('获取活动列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [currentPage, searchTerm, categoryFilter, statusFilter])

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  // 删除活动
  const handleDeleteActivity = async () => {
    if (!selectedActivity) return

    try {
      setFormLoading(true)
      const response = await fetch(`/api/admin/activities/${selectedActivity.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        showNotification('活动删除成功', 'success')
        setShowDeleteModal(false)
        setSelectedActivity(null)
        fetchActivities()
      } else {
        showNotification(data.error || '删除失败', 'error')
      }
    } catch (error) {
      console.error('删除活动失败:', error)
      showNotification('删除活动失败', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // 打开编辑模态框
  const handleEditActivity = (activity: any) => {
    setSelectedActivity(activity)
    setShowEditModal(true)
  }

  // 打开删除确认模态框
  const handleDeleteConfirm = (activity: any) => {
    setSelectedActivity(activity)
    setShowDeleteModal(true)
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  // 获取状态标签样式
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { bg: 'bg-green-100', text: 'text-green-800', label: '进行中' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '待审核' },
      'completed': { bg: 'bg-blue-100', text: 'text-blue-800', label: '已完成' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: '已取消' }
    }
    const config = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  // 获取分类标签样式
  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      '环保': { bg: 'bg-green-100', text: 'text-green-700' },
      '教育': { bg: 'bg-blue-100', text: 'text-blue-700' },
      '助老': { bg: 'bg-purple-100', text: 'text-purple-700' },
      '儿童': { bg: 'bg-pink-100', text: 'text-pink-700' },
      '其他': { bg: 'bg-gray-100', text: 'text-gray-700' }
    }
    const config = categoryMap[category] || { bg: 'bg-gray-100', text: 'text-gray-700' }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {category}
      </span>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100">
      <div className="px-6 py-5">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">活动管理</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>创建活动</span>
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="搜索活动标题、描述、地点..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全部分类</option>
            <option value="环保">环保</option>
            <option value="教育">教育</option>
            <option value="助老">助老</option>
            <option value="儿童">儿童</option>
            <option value="其他">其他</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全部状态</option>
            <option value="active">进行中</option>
            <option value="pending">待审核</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>

        {/* 活动列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">加载中...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">暂无活动数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <div key={activity.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{activity.title}</h4>
                      {getCategoryBadge(activity.category)}
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(activity.start_time)}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {activity.location}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {activity.current_volunteers}/{activity.required_volunteers} 人
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {Array.isArray(activity.required_skills) ? activity.required_skills.join(', ') : '无特殊要求'}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEditActivity(activity)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                      title="编辑活动"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(activity)}
                      className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                      title="删除活动"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              第 {currentPage} 页，共 {totalPages} 页
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}

        {/* 通知 */}
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        {/* 删除确认模态框 */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除活动 "{selectedActivity?.title}" 吗？此操作不可撤销。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedActivity(null)
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={formLoading}
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteActivity}
                  disabled={formLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 创建/编辑活动表单 */}
        <ActivityForm
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
            setSelectedActivity(null)
          }}
          activity={showEditModal ? selectedActivity : null}
          onSuccess={() => {
            showNotification(showEditModal ? '活动更新成功' : '活动创建成功', 'success')
            fetchActivities()
          }}
        />
      </div>
    </div>
  )
}

// 活动表单组件
function ActivityForm({
  isOpen,
  onClose,
  activity = null,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  activity?: any
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    start_time: '',
    end_time: '',
    location: '',
    required_volunteers: '',
    required_skills: [] as string[],
    status: 'draft'
  })
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  // 当活动数据变化时更新表单
  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        category: activity.category || '',
        start_time: activity.start_time ? new Date(activity.start_time).toISOString().slice(0, 16) : '',
        end_time: activity.end_time ? new Date(activity.end_time).toISOString().slice(0, 16) : '',
        location: activity.location || '',
        required_volunteers: activity.required_volunteers?.toString() || '',
        required_skills: Array.isArray(activity.required_skills) ? activity.required_skills : [],
        status: activity.status || 'draft'
      })
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        start_time: '',
        end_time: '',
        location: '',
        required_volunteers: '',
        required_skills: [],
        status: 'draft'
      })
    }
  }, [activity])

  // 添加技能
  const addSkill = () => {
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  // 移除技能
  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }))
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.start_time || !formData.end_time || !formData.location || !formData.required_volunteers) {
      alert('请填写所有必填字段')
      return
    }

    try {
      setLoading(true)

      const submitData = {
        ...formData,
        required_volunteers: parseInt(formData.required_volunteers),
        organization_id: 'org-001' // 临时硬编码，实际应该从用户信息获取
      }

      const url = activity
        ? `/api/admin/activities/${activity.id}`
        : '/api/admin/activities'

      const method = activity ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
        onClose()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {activity ? '编辑活动' : '创建活动'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 活动标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活动标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入活动标题"
                required
              />
            </div>

            {/* 活动描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活动描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入活动描述"
              />
            </div>

            {/* 活动分类和状态 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择分类</option>
                  <option value="环保">环保</option>
                  <option value="教育">教育</option>
                  <option value="助老">助老</option>
                  <option value="儿童">儿童</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">草稿</option>
                  <option value="pending_review">待审核</option>
                  <option value="recruiting">招募中</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>

            {/* 时间设置 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* 地点和人数 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动地点 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入活动地点"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  需要志愿者数量 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.required_volunteers}
                  onChange={(e) => setFormData(prev => ({ ...prev, required_volunteers: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入人数"
                  required
                />
              </div>
            </div>

            {/* 所需技能 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所需技能
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入技能要求，按回车添加"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  添加
                </button>
              </div>
              {formData.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.required_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '提交中...' : (activity ? '更新活动' : '创建活动')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// 审核管理组件
function ReviewsManagement() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  // 获取审核统计
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/reviews/stats')
      if (response.ok) {
        const result = await response.json()
        setStats(result.data)
      }
    } catch (error) {
      console.error('获取审核统计失败:', error)
    }
  }

  // 获取审核列表
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        type: typeFilter,
        status: statusFilter
      })

      const response = await fetch(`/api/admin/reviews?${params}`)
      if (response.ok) {
        const result = await response.json()
        setReviews(result.data)
        setTotalPages(result.totalPages)
      }
    } catch (error) {
      console.error('获取审核列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchReviews()
  }, [currentPage, typeFilter, statusFilter])

  // 获取类型显示名称
  const getTypeName = (type: string) => {
    switch (type) {
      case 'organization': return '组织审核'
      case 'activity': return '活动审核'
      case 'application': return '报名审核'
      case 'volunteer': return '志愿者认证'
      default: return type
    }
  }

  // 获取状态显示名称
  const getStatusName = (type: string, status: string) => {
    if (type === 'volunteer') {
      switch (status) {
        case 'pending': return '待认证'
        case 'verified': return '已认证'
        case 'rejected': return '已拒绝'
        default: return status
      }
    } else {
      switch (status) {
        case 'pending': return '待审核'
        case 'pending_review': return '待审核'
        case 'approved': return '已通过'
        case 'recruiting': return '已通过'
        case 'rejected': return '已拒绝'
        default: return status
      }
    }
  }

  // 获取状态颜色
  const getStatusColor = (type: string, status: string) => {
    const pendingStatuses = ['pending', 'pending_review']
    const approvedStatuses = ['approved', 'recruiting', 'verified']
    const rejectedStatuses = ['rejected']

    if (pendingStatuses.includes(status)) {
      return 'bg-yellow-100 text-yellow-800'
    } else if (approvedStatuses.includes(status)) {
      return 'bg-green-100 text-green-800'
    } else if (rejectedStatuses.includes(status)) {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  // 查看详情
  const handleViewDetail = async (review: any) => {
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}?type=${review.type}`)
      if (response.ok) {
        const result = await response.json()
        setSelectedReview(result.data)
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('获取详情失败:', error)
    }
  }

  // 审核操作
  const handleReview = (review: any) => {
    setSelectedReview(review)
    setShowReviewModal(true)
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden shadow-lg rounded-xl">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-orange-100 truncate">
                      待审核总数
                    </dt>
                    <dd className="text-2xl font-bold text-white">
                      {stats.totalStats.total_pending}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-xl">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-green-100 truncate">
                      已通过总数
                    </dt>
                    <dd className="text-2xl font-bold text-white">
                      {stats.totalStats.total_approved}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 overflow-hidden shadow-lg rounded-xl">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-red-100 truncate">
                      已拒绝总数
                    </dt>
                    <dd className="text-2xl font-bold text-white">
                      {stats.totalStats.total_rejected}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-blue-100 truncate">
                      今日审核
                    </dt>
                    <dd className="text-2xl font-bold text-white">
                      {stats.totalStats.total_today}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 审核列表 */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              审核管理
            </h3>
          </div>

          {/* 筛选器 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">所有类型</option>
                <option value="organization">组织审核</option>
                <option value="activity">活动审核</option>
                <option value="application">报名审核</option>
                <option value="volunteer">志愿者认证</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">所有状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setTypeFilter('')
                  setStatusFilter('')
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
              >
                重置筛选
              </button>
            </div>
          </div>

          {/* 审核列表 */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 mb-2">暂无审核项目</p>
              <p className="text-sm text-gray-400">所有审核项目都已处理完成</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        审核项目
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        申请人
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        申请时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {review.title}
                          </div>
                          {review.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {review.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{review.applicant_name}</div>
                          {review.applicant_contact && (
                            <div className="text-sm text-gray-500">{review.applicant_contact}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {getTypeName(review.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(review.type, review.status)}`}>
                            {getStatusName(review.type, review.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetail(review)}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            >
                              查看
                            </button>
                            {['pending', 'pending_review'].includes(review.status) && (
                              <button
                                onClick={() => handleReview(review)}
                                className="text-green-600 hover:text-green-900 transition-colors duration-200"
                              >
                                审核
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    第 {currentPage} 页，共 {totalPages} 页
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 详情模态框 */}
      {showDetailModal && selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedReview(null)
          }}
        />
      )}

      {/* 审核模态框 */}
      {showReviewModal && selectedReview && (
        <ReviewActionModal
          review={selectedReview}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedReview(null)
          }}
          onSuccess={() => {
            setShowReviewModal(false)
            setSelectedReview(null)
            fetchReviews()
            fetchStats()
          }}
        />
      )}
    </div>
  )
}

// 审核详情模态框
function ReviewDetailModal({ review, onClose }: { review: any, onClose: () => void }) {
  const renderDetailContent = () => {
    switch (review.type) {
      case 'organization':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">组织名称</label>
              <p className="mt-1 text-sm text-gray-900">{review.organization_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">统一社会信用代码</label>
              <p className="mt-1 text-sm text-gray-900">{review.unified_social_credit_code}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">联系人</label>
              <p className="mt-1 text-sm text-gray-900">{review.contact_person}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">联系电话</label>
              <p className="mt-1 text-sm text-gray-900">{review.contact_phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">邮箱</label>
              <p className="mt-1 text-sm text-gray-900">{review.contact_email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">地址</label>
              <p className="mt-1 text-sm text-gray-900">{review.address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">组织描述</label>
              <p className="mt-1 text-sm text-gray-900">{review.description}</p>
            </div>
          </div>
        )

      case 'activity':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">活动标题</label>
              <p className="mt-1 text-sm text-gray-900">{review.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">主办组织</label>
              <p className="mt-1 text-sm text-gray-900">{review.organization_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">活动描述</label>
              <p className="mt-1 text-sm text-gray-900">{review.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">活动地点</label>
              <p className="mt-1 text-sm text-gray-900">{review.location}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">开始时间</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(review.start_time).toLocaleString('zh-CN')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">结束时间</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(review.end_time).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">需要志愿者数量</label>
              <p className="mt-1 text-sm text-gray-900">{review.required_volunteers}人</p>
            </div>
          </div>
        )

      case 'application':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">志愿者姓名</label>
              <p className="mt-1 text-sm text-gray-900">{review.real_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">报名活动</label>
              <p className="mt-1 text-sm text-gray-900">{review.activity_title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">活动描述</label>
              <p className="mt-1 text-sm text-gray-900">{review.activity_description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">志愿者地区</label>
              <p className="mt-1 text-sm text-gray-900">{review.region}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">联系方式</label>
              <p className="mt-1 text-sm text-gray-900">{review.phone_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">申请留言</label>
              <p className="mt-1 text-sm text-gray-900">{review.application_message || '无'}</p>
            </div>
            {review.skills && review.skills.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">技能</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {review.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'volunteer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">真实姓名</label>
              <p className="mt-1 text-sm text-gray-900">{review.real_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">身份证号</label>
              <p className="mt-1 text-sm text-gray-900">{review.id_card_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">所在地区</label>
              <p className="mt-1 text-sm text-gray-900">{review.region}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">联系方式</label>
              <p className="mt-1 text-sm text-gray-900">{review.phone_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">个人简介</label>
              <p className="mt-1 text-sm text-gray-900">{review.bio || '无'}</p>
            </div>
            {review.skills && review.skills.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">技能</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {review.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {review.interests && review.interests.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">兴趣</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {review.interests.map((interest: string, index: number) => (
                    <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return <p>未知类型</p>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">审核详情</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {renderDetailContent()}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

// 审核操作模态框
function ReviewActionModal({
  review,
  onClose,
  onSuccess
}: {
  review: any,
  onClose: () => void,
  onSuccess: () => void
}) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve')
  const [reviewMessage, setReviewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: review.type,
          action,
          review_message: reviewMessage
        })
      })

      if (response.ok) {
        alert(`审核${action === 'approve' ? '通过' : '拒绝'}成功`)
        onSuccess()
      } else {
        const error = await response.json()
        alert(`审核失败: ${error.error}`)
      }
    } catch (error) {
      console.error('审核失败:', error)
      alert('审核失败')
    } finally {
      setLoading(false)
    }
  }

  const getActionText = () => {
    switch (review.type) {
      case 'organization':
        return action === 'approve' ? '通过组织审核' : '拒绝组织申请'
      case 'activity':
        return action === 'approve' ? '通过活动审核' : '拒绝活动申请'
      case 'application':
        return action === 'approve' ? '通过报名申请' : '拒绝报名申请'
      case 'volunteer':
        return action === 'approve' ? '通过身份认证' : '拒绝身份认证'
      default:
        return action === 'approve' ? '通过审核' : '拒绝申请'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">审核操作</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">审核项目</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{review.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">审核决定</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="approve"
                  checked={action === 'approve'}
                  onChange={(e) => setAction(e.target.value as 'approve')}
                  className="mr-2"
                />
                <span className="text-green-600">通过</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="reject"
                  checked={action === 'reject'}
                  onChange={(e) => setAction(e.target.value as 'reject')}
                  className="mr-2"
                />
                <span className="text-red-600">拒绝</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              审核意见 {action === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reviewMessage}
              onChange={(e) => setReviewMessage(e.target.value)}
              placeholder={action === 'approve' ? '可选：添加审核通过的说明' : '请说明拒绝的原因'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required={action === 'reject'}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || (action === 'reject' && !reviewMessage.trim())}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                action === 'approve'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {loading ? '处理中...' : getActionText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
