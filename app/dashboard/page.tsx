"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Heart, Calendar, Clock, MapPin, Star, Award, Bell, Settings, Plus, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ProfileCard from '@/components/volunteer/ProfileCard'
import ActivityList from '@/components/volunteer/ActivityList'
import RecommendationList from '@/components/volunteer/RecommendationList'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { user: authUser, logout, isLoading } = useAuth()
  const router = useRouter()

  // 处理活动申请成功后的刷新
  const handleActivityApplied = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // 如果用户未登录，重定向到登录页
  // 如果是管理员用户，重定向到管理后台
  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push('/login')
    } else if (!isLoading && authUser) {
      // 如果是管理员用户，重定向到管理后台
      if (authUser.user_type === 'platform_admin' || authUser.user_type === 'organization_admin') {
        console.log('🔄 管理员用户，重定向到管理后台')
        router.push('/admin')
        return
      }
    }
  }, [authUser, isLoading, router])

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return null
  }

  // 使用真实的用户数据
  const user = {
    name: authUser.username || "未设置",
    avatar: "/placeholder.svg?height=80&width=80",
    email: authUser.email || "未设置",
    phone: authUser.phone_number ? `${authUser.phone_number.slice(0, 3)}****${authUser.phone_number.slice(-4)}` : "未设置",
    region: "未设置", // 这个需要从志愿者资料中获取
    joinDate: authUser.created_at ? new Date(authUser.created_at).toLocaleDateString('zh-CN') : "未知",
    totalHours: 0, // 这个需要从志愿者资料中获取
    activitiesCount: 0, // 这个需要从API获取
    rating: 0, // 这个需要从API获取
    level: "新手志愿者", // 这个需要根据服务时长计算
    skills: [], // 这个需要从志愿者资料中获取
    interests: [], // 这个需要从志愿者资料中获取
  }

  const myActivities = [
    {
      id: 1,
      title: "社区环保清洁活动",
      organization: "绿色家园环保协会",
      date: "2024-02-15",
      status: "upcoming",
      hours: 8,
      location: "北京市朝阳区",
    },
    {
      id: 2,
      title: "儿童教育支教活动",
      organization: "希望之光教育基金会",
      date: "2024-01-20",
      status: "completed",
      hours: 16,
      location: "河北省承德市",
      rating: 5,
    },
    {
      id: 3,
      title: "老年人关爱服务",
      organization: "夕阳红志愿服务队",
      date: "2024-01-15",
      status: "completed",
      hours: 6,
      location: "北京市朝阳区",
      rating: 4,
    },
  ]

  const recommendations = [
    {
      id: 4,
      title: "残障儿童康复辅助",
      organization: "阳光康复中心",
      date: "2024-02-22",
      matchScore: 95,
      location: "北京市海淀区",
      skills: ["心理咨询", "耐心细致"],
    },
    {
      id: 5,
      title: "文化遗产保护宣传",
      organization: "文化传承协会",
      date: "2024-02-25",
      matchScore: 88,
      location: "北京市东城区",
      skills: ["文化知识", "宣传能力"],
    },
    {
      id: 6,
      title: "应急救援技能培训",
      organization: "红十字会",
      date: "2024-02-28",
      matchScore: 82,
      location: "北京市西城区",
      skills: ["急救技能", "体能要求"],
    },
  ]

  const notifications = [
    {
      id: 1,
      type: "activity",
      title: "活动提醒",
      message: "您报名的社区环保清洁活动将于明天开始",
      time: "2小时前",
      unread: true,
    },
    {
      id: 2,
      type: "system",
      title: "系统通知",
      message: "您的志愿服务时长已达到156小时，获得金牌志愿者称号",
      time: "1天前",
      unread: true,
    },
    {
      id: 3,
      type: "evaluation",
      title: "服务评价",
      message: "希望之光教育基金会对您的服务给出了5星好评",
      time: "3天前",
      unread: false,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800">即将开始</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">已完成</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">已取消</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">智能志愿者平台</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/activities" className="text-gray-600 hover:text-blue-600">
                志愿活动
              </Link>
              <Link href="/organizations" className="text-gray-600 hover:text-blue-600">
                合作组织
              </Link>
              <Link href="/dashboard" className="text-blue-600 font-medium">
                个人中心
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={authUser?.username ? `/placeholder.svg` : "/placeholder.svg"} />
                <AvatarFallback>{authUser?.username?.slice(0, 2) || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来，{authUser.username}！</h1>
          <p className="text-gray-600">继续您的志愿服务之旅，用爱心温暖世界</p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
            <span>账户类型: {authUser.user_type === 'volunteer' ? '志愿者' : authUser.user_type === 'organization_admin' ? '组织管理员' : '平台管理员'}</span>
            <span>状态: {authUser.status === 'active' ? '已激活' : authUser.status === 'pending_verification' ? '待验证' : '未激活'}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">服务时长</p>
                  <p className="text-2xl font-bold text-gray-900">{user.totalHours}</p>
                  <p className="text-xs text-gray-500">小时</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">参与活动</p>
                  <p className="text-2xl font-bold text-gray-900">{user.activitiesCount}</p>
                  <p className="text-xs text-gray-500">次</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">服务评分</p>
                  <p className="text-2xl font-bold text-gray-900">{user.rating}</p>
                  <p className="text-xs text-gray-500">分</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">志愿者等级</p>
                  <p className="text-lg font-bold text-gray-900">{user.level}</p>
                  <p className="text-xs text-gray-500">当前等级</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="profile">个人资料</TabsTrigger>
                <TabsTrigger value="activities">我的活动</TabsTrigger>
                <TabsTrigger value="recommendations">推荐活动</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle>最近活动</CardTitle>
                    <CardDescription>您最近参与的志愿活动</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {myActivities.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                            <p className="text-sm text-gray-600">{activity.organization}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {activity.date}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {activity.hours}小时
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {activity.location}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(activity.status)}
                            {activity.rating && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm ml-1">{activity.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" className="w-full bg-transparent">
                        查看全部活动
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle>本月进度</CardTitle>
                    <CardDescription>您本月的志愿服务进度</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>服务时长目标</span>
                          <span>24/30 小时</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>活动参与目标</span>
                          <span>2/3 次</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <ProfileCard />
              </TabsContent>

              <TabsContent value="activities" className="space-y-6">
                <ActivityList refreshTrigger={refreshTrigger} />
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <RecommendationList onActivityApplied={handleActivityApplied} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>个人资料</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.level}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm ml-1">{user.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">邮箱:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">手机:</span>
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">地区:</span>
                    <span>{user.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">加入时间:</span>
                    <span>{user.joinDate}</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  编辑资料
                </Button>
              </CardContent>
            </Card>

            {/* Skills & Interests */}
            <Card>
              <CardHeader>
                <CardTitle>技能与兴趣</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">技能特长</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">兴趣领域</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  更新技能
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>最新通知</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? "bg-blue-600" : "bg-gray-300"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  查看全部通知
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
