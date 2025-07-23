"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, User, Building, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { UserType } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  
  const [activeTab, setActiveTab] = useState<UserType>("volunteer")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as UserType)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 基础验证
    if (!formData.username || !formData.email || !formData.phone_number || !formData.password) {
      toast.error('请填写所有必填字段')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    if (formData.password.length < 8) {
      toast.error('密码长度至少8位')
      return
    }

    // 准备注册数据
    const registerData = {
      username: formData.username,
      email: formData.email,
      phone_number: formData.phone_number,
      password: formData.password,
      user_type: activeTab
    }

    const result = await register(registerData)
    
    if (result.success) {
      toast.success('注册成功！')
      router.push('/dashboard')
    } else {
      toast.error(result.error || '注册失败')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">智能志愿者平台</h1>
          </div>
          <p className="text-gray-600">创建您的账户</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>注册账户</CardTitle>
            <CardDescription>选择您的账户类型并填写信息</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="volunteer" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>志愿者</span>
                </TabsTrigger>
                <TabsTrigger value="organization_admin" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>组织</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="volunteer" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">志愿者注册</h3>
                  <p className="text-sm text-gray-600">加入我们，开始您的志愿服务之旅</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="请输入用户名"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">邮箱地址</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="请输入邮箱地址"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone_number">手机号码</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="请输入手机号码"
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
                      placeholder="请输入密码（至少8位）"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">确认密码</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="请再次输入密码"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        注册中...
                      </>
                    ) : (
                      '注册志愿者账户'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="organization_admin" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">组织注册</h3>
                  <p className="text-sm text-gray-600">注册您的组织，发布志愿活动</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="请输入用户名"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">邮箱地址</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="请输入邮箱地址"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone_number">手机号码</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="请输入手机号码"
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
                      placeholder="请输入密码（至少8位）"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">确认密码</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="请再次输入密码"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        注册中...
                      </>
                    ) : (
                      '注册组织账户'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                已有账户？
                <Link href="/login" className="text-blue-600 hover:underline ml-1">
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
