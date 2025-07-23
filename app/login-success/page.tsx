"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

function LoginSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [waitTime, setWaitTime] = useState(0)

  const redirectTo = searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    // 增加等待计数器
    const timer = setInterval(() => {
      setWaitTime(prev => prev + 1)
    }, 100)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    console.log('登录成功页面状态:', { user: !!user, isLoading, waitTime })

    // 如果用户已登录，跳转到目标页面
    if (user && !isLoading) {
      console.log('登录成功页面: 用户已登录，跳转到:', redirectTo)
      window.location.href = redirectTo
      return
    }

    // 等待至少2秒让AuthContext初始化
    if (waitTime > 20) { // 20 * 100ms = 2秒
      // 如果等待2秒后用户还是未登录，跳转回登录页
      if (!user && !isLoading) {
        console.log('登录成功页面: 等待超时，用户未登录，跳转回登录页')
        router.push('/login')
      }
    }
  }, [user, isLoading, redirectTo, router, waitTime])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">登录成功，正在跳转...</p>
        <p className="mt-2 text-sm text-gray-400">等待时间: {(waitTime * 100)}ms</p>
      </div>
    </div>
  )
}

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginSuccessContent />
    </Suspense>
  )
}
