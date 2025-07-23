import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, MapPin, Clock, Heart, Star, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const featuredActivities = [
    {
      id: 1,
      title: "社区环保清洁活动",
      organization: "绿色家园环保协会",
      location: "北京市朝阳区",
      date: "2024-02-15",
      volunteers: 12,
      maxVolunteers: 20,
      skills: ["环保意识", "体力劳动"],
      status: "recruiting",
    },
    {
      id: 2,
      title: "儿童教育支教活动",
      organization: "希望之光教育基金会",
      location: "河北省承德市",
      date: "2024-02-20",
      volunteers: 8,
      maxVolunteers: 15,
      skills: ["教学经验", "耐心细致"],
      status: "recruiting",
    },
    {
      id: 3,
      title: "老年人关爱服务",
      organization: "夕阳红志愿服务队",
      location: "上海市浦东新区",
      date: "2024-02-18",
      volunteers: 15,
      maxVolunteers: 25,
      skills: ["沟通能力", "医护知识"],
      status: "recruiting",
    },
  ]

  const stats = [
    { label: "注册志愿者", value: "12,580", icon: Users },
    { label: "活动总数", value: "3,240", icon: Calendar },
    { label: "服务时长", value: "45,680小时", icon: Clock },
    { label: "合作组织", value: "580", icon: Heart },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">智能志愿者平台</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/activities" className="text-gray-600 hover:text-blue-600 transition-colors">
                志愿活动
              </Link>
              <Link href="/organizations" className="text-gray-600 hover:text-blue-600 transition-colors">
                合作组织
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                关于我们
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

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">连接爱心，传递温暖</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            通过智能匹配技术，让每一份爱心都能找到最合适的归宿，让每一个需要帮助的地方都能得到及时的支援
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" asChild>
              <Link href="/register?type=volunteer">成为志愿者</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent" asChild>
              <Link href="/register?type=organization">注册组织</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Activities */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">热门志愿活动</h3>
            <p className="text-gray-600">发现适合你的志愿服务机会</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredActivities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2">{activity.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">{activity.organization}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      招募中
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {activity.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {activity.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {activity.volunteers}/{activity.maxVolunteers} 人
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {activity.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full mt-4" asChild>
                      <Link href={`/activities/${activity.id}`}>查看详情</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/activities">查看更多活动</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">平台特色</h3>
            <p className="text-gray-600">为什么选择我们的志愿者平台</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">智能匹配</h4>
              <p className="text-gray-600">基于技能、兴趣、地理位置等多维度信息，智能推荐最适合的志愿活动和志愿者</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">数据分析</h4>
              <p className="text-gray-600">详细的服务记录和数据统计，帮助志愿者和组织更好地了解服务效果和影响力</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">便捷管理</h4>
              <p className="text-gray-600">简单易用的管理界面，让志愿活动的发布、报名、管理变得更加高效便捷</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6" />
                <span className="text-lg font-semibold">智能志愿者平台</span>
              </div>
              <p className="text-gray-400 text-sm">连接爱心，传递温暖。让志愿服务更智能、更高效、更有意义。</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">快速链接</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/activities" className="hover:text-white transition-colors">
                    志愿活动
                  </Link>
                </li>
                <li>
                  <Link href="/organizations" className="hover:text-white transition-colors">
                    合作组织
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    联系我们
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">帮助支持</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    使用帮助
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    常见问题
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    隐私政策
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    服务条款
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">联系方式</h5>
              <div className="space-y-2 text-sm text-gray-400">
                <p>客服热线：400-123-4567</p>
                <p>邮箱：support@volunteer.com</p>
                <p>地址：北京市朝阳区志愿者大厦</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 智能志愿者平台. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
