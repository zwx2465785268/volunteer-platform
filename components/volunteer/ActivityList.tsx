'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Building2, 
  Phone,
  MessageSquare,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Activity {
  application_id: string;
  application_status: string;
  application_time: string;
  application_message: string;
  review_message: string;
  reviewed_at: string;
  activity: {
    id: string;
    title: string;
    description: string;
    category: string;
    start_time: string;
    end_time: string;
    location: string;
    required_volunteers: number;
    current_volunteers: number;
    required_skills: string[];
    status: string;
  };
  organization: {
    name: string;
    contact_person: string;
    contact_phone: string;
  };
}

interface ActivityListProps {
  refreshTrigger?: number;
}

export default function ActivityList({ refreshTrigger }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [cancelling, setCancelling] = useState<string | null>(null);

  // 加载活动列表
  const loadActivities = async (type: string = 'all') => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/volunteer/activities?type=${type}&limit=20`);
      if (response.success) {
        setActivities(response.data.activities);
      } else {
        toast.error(response.error?.message || '加载活动列表失败');
      }
    } catch (error) {
      console.error('加载活动列表失败:', error);
      toast.error('加载活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 取消申请
  const cancelApplication = async (applicationId: string) => {
    try {
      setCancelling(applicationId);
      const response = await apiClient.delete(`/volunteer/apply?application_id=${applicationId}`);
      if (response.success) {
        toast.success('申请已取消');
        await loadActivities(activeTab);
      } else {
        toast.error(response.error?.message || '取消申请失败');
      }
    } catch (error) {
      console.error('取消申请失败:', error);
      toast.error('取消申请失败');
    } finally {
      setCancelling(null);
    }
  };

  // 获取状态显示
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '待审核', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
      case 'approved':
        return { text: '已通过', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rejected':
        return { text: '已拒绝', color: 'bg-red-100 text-red-800', icon: X };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  // 格式化时间
  const formatTime = (timeString: string) => {
    try {
      return format(new Date(timeString), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
    } catch {
      return timeString;
    }
  };

  // 检查活动是否可以取消申请
  const canCancelApplication = (activity: Activity) => {
    return activity.application_status === 'pending' && 
           new Date(activity.activity.start_time) > new Date();
  };

  useEffect(() => {
    loadActivities(activeTab);
  }, [activeTab, refreshTrigger]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>我的活动</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="upcoming">即将开始</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
            <TabsTrigger value="pending">待审核</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无相关活动</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const statusDisplay = getStatusDisplay(activity.application_status);
                  const StatusIcon = statusDisplay.icon;

                  return (
                    <div key={activity.application_id} className="border rounded-lg p-4 space-y-3">
                      {/* 活动标题和状态 */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{activity.activity.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{activity.activity.category}</Badge>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusDisplay.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusDisplay.text}
                            </span>
                          </div>
                        </div>
                        {canCancelApplication(activity) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelApplication(activity.application_id)}
                            disabled={cancelling === activity.application_id}
                            className="text-red-600 hover:text-red-700"
                          >
                            {cancelling === activity.application_id ? '取消中...' : '取消申请'}
                          </Button>
                        )}
                      </div>

                      {/* 活动详情 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatTime(activity.activity.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(activity.activity.end_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{activity.activity.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{activity.activity.current_volunteers}/{activity.activity.required_volunteers} 人</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{activity.organization.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{activity.organization.contact_phone}</span>
                        </div>
                      </div>

                      {/* 技能要求 */}
                      {activity.activity.required_skills && activity.activity.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-gray-500">技能要求:</span>
                          {activity.activity.required_skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* 申请信息 */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">申请时间:</span>
                          <span className="text-gray-600">{formatTime(activity.application_time)}</span>
                        </div>
                        {activity.application_message && (
                          <div className="text-sm">
                            <span className="font-medium">申请留言:</span>
                            <p className="text-gray-600 mt-1">{activity.application_message}</p>
                          </div>
                        )}
                        {activity.review_message && (
                          <div className="text-sm">
                            <span className="font-medium">审核意见:</span>
                            <p className="text-gray-600 mt-1">{activity.review_message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
