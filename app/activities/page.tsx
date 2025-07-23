"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Calendar, Users, Clock, Filter, Heart, Star } from "lucide-react"
import Link from "next/link"

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const activities = [
    {
      id: 1,
      title: "社区环保清洁活动",
      organization: "绿色家园环保协会",
      location: "北京市朝阳区",
      date: "2024-02-15",
      time: "09:00-17:00",
      volunteers: 12,
      maxVolunteers: 20,
      skills: ["环保意识", "体力劳动"],
      category: "环境保护",
      status: "recruiting",
      rating: 4.8,
      description: "参与社区环保清洁活动，共同维护美好家园环境，提高环保意识。",
    },
    {
      id: 2,
      title: "儿童教育支教活动",
      organization: "希望之光教育基金会",
      location: "河北省承德市",
      date: "2024-02-20",
      time: "08:00-18:00",
      volunteers: 8,
      maxVolunteers: 15,
      skills: ["教学经验", "耐心细致"],
      category: "教育支教",
      status: "recruiting",
      rating: 4.9,
      description: "为山区儿童提供教育支持，传递知识与爱心，点亮孩子们的未来。",
    },
    {
      id: 3,
      title: "老年人关爱服务",
      organization: "夕阳红志愿服务队",
      location: "上海市浦东新区",
      date: "2024-02-18",
      time: "14:00-17:00",
      volunteers: 15,
      maxVolunteers: 25,
      skills: ["沟通能力", "医护知识"],
      category: "养老服务",
      status: "recruiting",
      rating: 4.7,
      description: "陪伴老年人，提供生活照料和精神慰藉，让老人感受到社会的温暖。",
    },
    {
      id: 4,
      title: "残障儿童康复辅助",
      organization: "阳光康复中心",
      location: "广州市天河区",
      date: "2024-02-22",
      time: "10:00-16:00",
      volunteers: 6,
      maxVolunteers: 12,
      skills: ["心理咨询", "康复知识"],
      category: "儿童关爱",
      status: "recruiting",
      rating: 4.6,
      description: "协助残障儿童进行康复训练，用爱心和专业知识帮助他们重建信心。",
    },
    {
      id: 5,
      title: "文化遗产保护宣传",
      organization: "文化传承协会",
      location: "西安市雁塔区",
      date: "2024-02-25",
      time: "09:00-17:00",
      volunteers: 20,
      maxVolunteers: 30,
      skills: ["文化知识", "宣传能力"],
      category: "文化传承",
      status: "recruiting",
      rating: 4.5,
      description: "参与文化遗产保护宣传活动，传承中华优秀传统文化。",
    },
    {
      id: 6,
      title: "应急救援技能培训",
      organization: "红十字会",
      location: "成都市武侯区",
      date: "2024-02-28",
      time: "08:00-18:00",
      volunteers: 25,
      maxVolunteers: 40,
      skills: ["急救技能", "体能要求"],
      category: "应急救援",
      status: "recruiting",
      rating: 4.8,
      description: "学习应急救援技能，提高自救互救能力，为社会安全贡献力量。",
    },
  ]

  const categories = [
    "全部分类",
    "环境保护",
    "教育支教",
    "养老服务",
    "儿童关爱",
    "文化传承",
    "应急救援",
    "医疗健康",
    "扶贫助困",
    "社区服务",
  ]

  const regions = [
    "全部地区",
    "北京市",
    "上海市",
    "广州市",
    "深圳市",
    "杭州市",
    "成都市",
    "西安市",
    "武汉市",
    "南京市",
    "天津市",
  ]

  const skillOptions = [
    "教学经验",
    "医护知识",
    "心理咨询",
    "翻译能力",
    "计算机技能",
    "艺术才能",
    "体育运动",
    "环保知识",
    "法律咨询",
    "财务管理",
    "沟通能力",
    "组织协调",
    "急救技能",
    "康复知识",
    "文化知识",
  ]

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.organization.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRegion =
      !selectedRegion || selectedRegion === "全部地区" || activity.location.includes(selectedRegion.replace("市", ""))
    const matchesCategory =
      !selectedCategory || selectedCategory === "全部分类" || activity.category === selectedCategory
    const matchesSkills = selectedSkills.length === 0 || selectedSkills.some((skill) => activity.skills.includes(skill))

    return matchesSearch && matchesRegion && matchesCategory && matchesSkills
  })

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
              <Link href="/activities" className="text-blue-600 font-medium">
                志愿活动
              </Link>
              <Link href="/organizations" className="text-gray-600 hover:text-blue-600">
                合作组织
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-blue-600">
                个人中心
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/register">注册</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">志愿活动</h1>
          <p className="text-gray-600">发现适合您的志愿服务机会，用爱心点亮世界</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索活动名称或组织..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="选择地区" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>筛选</span>
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">所需技能</Label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {skillOptions.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <Label htmlFor={`skill-${skill}`} className="text-sm">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSkills([])
                      setSelectedRegion("")
                      setSelectedCategory("")
                      setSearchQuery("")
                    }}
                  >
                    清除筛选
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            找到 <span className="font-semibold text-gray-900">{filteredActivities.length}</span> 个活动
          </p>
          <Select defaultValue="latest">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">最新发布</SelectItem>
              <SelectItem value="popular">最受欢迎</SelectItem>
              <SelectItem value="urgent">急需志愿者</SelectItem>
              <SelectItem value="nearby">距离最近</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{activity.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">{activity.organization}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{activity.rating}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">
                  {activity.status === "recruiting" ? "招募中" : "已结束"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{activity.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{activity.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{activity.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        {activity.volunteers}/{activity.maxVolunteers} 人
                      </span>
                      <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(activity.volunteers / activity.maxVolunteers) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {activity.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button className="flex-1" asChild>
                      <Link href={`/activities/${activity.id}`}>查看详情</Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredActivities.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              加载更多活动
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关活动</h3>
            <p className="text-gray-600 mb-4">尝试调整搜索条件或筛选器，或者</p>
            <Button asChild>
              <Link href="/activities/create">发布新活动</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
