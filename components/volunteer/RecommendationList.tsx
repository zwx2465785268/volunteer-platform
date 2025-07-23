'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Building2, 
  Phone,
  Star,
  Send,
  Heart,
  Target,
  Award
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface RecommendedActivity {
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
  organization: {
    name: string;
    contact_person: string;
    contact_phone: string;
    address: string;
  };
  match_info: {
    total_score: number;
    skill_matches: string[];
    interest_matches: string[];
    location_match: boolean;
    urgency_level: string;
  };
}

interface RecommendationListProps {
  onActivityApplied?: () => void;
}

export default function RecommendationList({ onActivityApplied }: RecommendationListProps) {
  const [recommendations, setRecommendations] = useState<RecommendedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<RecommendedActivity | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');

  // 加载推荐活动
  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/volunteer/recommendations?limit=10');
      if (response.success) {
        setRecommendations(response.data.recommendations);
      } else {
        toast.error(response.error?.message || '加载推荐活动失败');
      }
    } catch (error) {
      console.error('加载推荐活动失败:', error);
      toast.error('加载推荐活动失败');
    } finally {
      setLoading(false);
    }
  };

  // 申请活动
  const applyForActivity = async (activityId: string) => {
    try {
      setApplying(activityId);
      const response = await apiClient.post('/volunteer/apply', {
        activity_id: activityId,
        application_message: applicationMessage
      });

      if (response.success) {
        toast.success('申请提交成功，请等待审核');
        setSelectedActivity(null);
        setApplicationMessage('');
        onActivityApplied?.();
        await loadRecommendations(); // 重新加载推荐
      } else {
        toast.error(response.error?.message || '申请提交失败');
      }
    } catch (error) {
      console.error('申请活动失败:', error);
      toast.error('申请提交失败');
    } finally {
      setApplying(null);
    }
  };

  // 格式化时间
  const formatTime = (timeString: string) => {
    try {
      return format(new Date(timeString), 'MM月dd日 HH:mm', { locale: zhCN });
    } catch {
      return timeString;
    }
  };

  // 获取匹配度颜色
  const getScoreColor = (score: number) => {
    if (score >= 50) return 'text-green-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // 获取匹配度星级
  const getScoreStars = (score: number) => {
    const stars = Math.min(5, Math.max(1, Math.ceil(score / 20)));
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

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
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          智能推荐
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无推荐活动</p>
            <p className="text-sm mt-2">完善您的个人资料可获得更精准的推荐</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                {/* 活动标题和匹配度 */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{activity.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{activity.category}</Badge>
                      {activity.match_info.urgency_level === 'high' && (
                        <Badge variant="destructive" className="text-xs">急需志愿者</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {getScoreStars(activity.match_info.total_score)}
                    </div>
                    <div className={`text-sm font-medium ${getScoreColor(activity.match_info.total_score)}`}>
                      匹配度: {activity.match_info.total_score}分
                    </div>
                  </div>
                </div>

                {/* 活动详情 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatTime(activity.start_time)} - {formatTime(activity.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{activity.location}</span>
                    {activity.match_info.location_match && (
                      <Badge variant="secondary" className="text-xs">同城</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{activity.current_volunteers}/{activity.required_volunteers} 人</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{activity.organization.name}</span>
                  </div>
                </div>

                {/* 匹配信息 */}
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  {activity.match_info.skill_matches.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-blue-700 font-medium">技能匹配:</span>
                      {activity.match_info.skill_matches.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {activity.match_info.interest_matches.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-blue-700 font-medium">兴趣匹配:</span>
                      {activity.match_info.interest_matches.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* 技能要求 */}
                {activity.required_skills && activity.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500">技能要求:</span>
                    {activity.required_skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 活动描述 */}
                <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>

                {/* 申请按钮 */}
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedActivity(activity)}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        立即申请
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>申请参加活动</DialogTitle>
                      </DialogHeader>
                      {selectedActivity && (
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold">{selectedActivity.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{selectedActivity.organization.name}</p>
                            <p className="text-sm text-gray-600">
                              {formatTime(selectedActivity.start_time)} - {formatTime(selectedActivity.end_time)}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="application_message">申请留言（可选）</Label>
                            <Textarea
                              id="application_message"
                              value={applicationMessage}
                              onChange={(e) => setApplicationMessage(e.target.value)}
                              placeholder="请简单介绍一下您的相关经验或参与动机..."
                              rows={4}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedActivity(null);
                                setApplicationMessage('');
                              }}
                            >
                              取消
                            </Button>
                            <Button
                              onClick={() => applyForActivity(selectedActivity.id)}
                              disabled={applying === selectedActivity.id}
                            >
                              {applying === selectedActivity.id ? '提交中...' : '确认申请'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
