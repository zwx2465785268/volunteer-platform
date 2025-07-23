'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Award, Edit, Save, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface VolunteerProfile {
  id: string;
  user_id: string;
  real_name: string;
  id_card_number?: string;
  gender?: string;
  date_of_birth?: string;
  region?: string;
  skills?: string[];
  interests?: string[];
  bio?: string;
  total_service_hours: number;
  verification_status: string;
  // 用户基本信息（只读）
  user: {
    username: string;
    email: string;
    phone_number: string;
  };
  // 统计信息（只读）
  stats?: {
    total_activities: number;
    approved_activities: number;
    pending_activities: number;
    service_hours: number;
  };
}

export default function ProfileCard() {
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<VolunteerProfile>>({});

  // 加载个人资料
  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('开始加载个人资料...');
      const response = await apiClient.get('/volunteer/profile');
      console.log('API响应:', response);

      if (response.success) {
        console.log('个人资料数据:', response.data.profile);
        setProfile(response.data.profile);
        setFormData(response.data.profile);
      } else {
        console.error('API返回错误:', response.error);
        toast.error(response.error?.message || '加载个人资料失败');
      }
    } catch (error) {
      console.error('加载个人资料失败:', error);
      toast.error('加载个人资料失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存个人资料
  const saveProfile = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/volunteer/profile', formData);
      if (response.success) {
        toast.success('个人资料更新成功');
        setEditing(false);
        await loadProfile(); // 重新加载数据
      } else {
        toast.error(response.error?.message || '更新个人资料失败');
      }
    } catch (error) {
      console.error('更新个人资料失败:', error);
      toast.error('更新个人资料失败');
    } finally {
      setSaving(false);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setFormData(profile || {});
    setEditing(false);
  };

  // 处理技能变化
  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, skills }));
  };

  // 处理兴趣变化
  const handleInterestsChange = (value: string) => {
    const interests = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, interests }));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">无法加载个人资料</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          个人资料
        </CardTitle>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {saving ? '保存中...' : '保存'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEdit}
                disabled={saving}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                取消
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              编辑
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 账户信息 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">账户信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs text-gray-500">用户名</Label>
              {editing ? (
                <Input
                  id="username"
                  value={formData.user?.username || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    user: { ...prev.user, username: e.target.value }
                  }))}
                  placeholder="请输入用户名"
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-gray-600">{profile.user?.username || '未设置'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-gray-500 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                邮箱
              </Label>
              {editing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.user?.email || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    user: { ...prev.user, email: e.target.value }
                  }))}
                  placeholder="请输入邮箱"
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-gray-600">{profile.user?.email || '未设置'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                手机号
              </Label>
              {editing ? (
                <Input
                  id="phone_number"
                  value={formData.user?.phone_number || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    user: { ...prev.user, phone_number: e.target.value }
                  }))}
                  placeholder="请输入手机号"
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-gray-600">{profile.user?.phone_number || '未设置'}</p>
              )}
            </div>
          </div>
        </div>

        {/* 志愿者资料 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="real_name">真实姓名 *</Label>
            {editing ? (
              <Input
                id="real_name"
                value={formData.real_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, real_name: e.target.value }))}
                placeholder="请输入真实姓名"
                required
              />
            ) : (
              <p className="text-sm text-gray-600">{profile.real_name || '未填写'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_card_number">身份证号码</Label>
            {editing ? (
              <Input
                id="id_card_number"
                value={formData.id_card_number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, id_card_number: e.target.value }))}
                placeholder="请输入身份证号码"
                maxLength={18}
              />
            ) : (
              <p className="text-sm text-gray-600">
                {profile.id_card_number ?
                  `${profile.id_card_number.slice(0, 6)}****${profile.id_card_number.slice(-4)}` :
                  '未填写'
                }
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">性别</Label>
            {editing ? (
              <Select
                value={formData.gender || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-600">
                {profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : profile.gender === 'other' ? '其他' : '未填写'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              出生日期
            </Label>
            {editing ? (
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            ) : (
              <p className="text-sm text-gray-600">{profile.date_of_birth || '未填写'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="region" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              所在地区
            </Label>
            {editing ? (
              <Input
                id="region"
                value={formData.region || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                placeholder="请输入所在地区"
              />
            ) : (
              <p className="text-sm text-gray-600">{profile.region || '未填写'}</p>
            )}
          </div>
        </div>

        {/* 认证状态和服务时长 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">认证状态</Label>
            <div className="flex items-center gap-2">
              {profile.verification_status === 'verified' && (
                <Badge variant="default" className="bg-green-500">已认证</Badge>
              )}
              {profile.verification_status === 'pending' && (
                <Badge variant="secondary">待认证</Badge>
              )}
              {profile.verification_status === 'rejected' && (
                <Badge variant="destructive">认证失败</Badge>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500 flex items-center gap-1">
              <Award className="h-3 w-3" />
              累计服务时长
            </Label>
            <p className="text-sm font-medium text-blue-600">
              {profile.total_service_hours || 0} 小时
            </p>
          </div>
        </div>

        <Separator />

        {/* 技能和兴趣 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skills">专业技能</Label>
            {editing ? (
              <Input
                id="skills"
                value={formData.skills?.join(', ') || ''}
                onChange={(e) => handleSkillsChange(e.target.value)}
                placeholder="请输入技能，用逗号分隔"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">未填写</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">兴趣爱好</Label>
            {editing ? (
              <Input
                id="interests"
                value={formData.interests?.join(', ') || ''}
                onChange={(e) => handleInterestsChange(e.target.value)}
                placeholder="请输入兴趣爱好，用逗号分隔"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map((interest, index) => (
                    <Badge key={index} variant="outline">{interest}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">未填写</p>
                )}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* 个人简介 */}
        <div className="space-y-2">
          <Label htmlFor="bio">个人简介</Label>
          {editing ? (
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="请介绍一下自己..."
              rows={4}
            />
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {profile.bio || '这个人很懒，什么都没有留下...'}
            </p>
          )}
        </div>

        <Separator />

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.stats.service_hours}</div>
            <div className="text-sm text-gray-500">服务时长(小时)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{profile.stats.approved_activities}</div>
            <div className="text-sm text-gray-500">参与活动</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{profile.stats.pending_activities}</div>
            <div className="text-sm text-gray-500">待审核</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className={`text-sm px-2 py-1 rounded ${
                profile.verification_status === 'verified' 
                  ? 'bg-green-100 text-green-800' 
                  : profile.verification_status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {profile.verification_status === 'verified' ? '已认证' : 
                 profile.verification_status === 'pending' ? '待认证' : '未认证'}
              </span>
            </div>
            <div className="text-sm text-gray-500">认证状态</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
