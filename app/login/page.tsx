"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from 'sonner'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })

  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔄 表单提交开始')

    if (!formData.identifier || !formData.password) {
      toast.error('请填写所有字段')
      return
    }

    setIsLoading(true)
    console.log('📤 发送登录请求...')

    try {
      // 使用AuthContext进行登录
      const result = await login(formData)
      console.log('📋 登录结果:', result)

      if (result.success) {
        toast.success('登录成功！')
        console.log('✅ 登录成功')

        // 等待一小段时间让AuthContext更新用户状态
        setTimeout(() => {
          // 根据redirectTo参数决定跳转地址，如果没有则跳转到dashboard
          const targetUrl = redirectTo === '/dashboard' ? '/dashboard' : redirectTo
          console.log('🔄 跳转到:', targetUrl)
          router.push(targetUrl)
        }, 100)

      } else {
        console.log('❌ 登录失败:', result.error)
        toast.error(result.error || '登录失败')
      }
    } catch (error) {
      console.error('❌ 登录错误:', error)
      toast.error('登录失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <Heart className="h-6 w-6" />
            <span className="text-lg font-semibold">智能志愿者平台</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h1>
          <p className="text-gray-600">登录您的账户继续志愿服务之旅</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>登录账户</CardTitle>
            <CardDescription>使用您的用户名、邮箱或手机号登录</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Login Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="identifier">用户名/邮箱/手机号</Label>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    placeholder="请输入用户名、邮箱或手机号"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="请输入密码"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  忘记密码？
                </Link>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">或者</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  还没有账户？
                  <Link href="/register" className="text-blue-600 hover:underline ml-1">
                    立即注册
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
