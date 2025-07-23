-- 智能志愿者平台测试数据插入脚本

-- 插入系统配置
INSERT INTO system_configs (config_key, config_value, description) VALUES
('platform_name', '智能志愿者平台', '平台名称'),
('max_volunteers_per_activity', '100', '单个活动最大志愿者数量'),
('service_hour_calculation', 'auto', '服务时长计算方式'),
('notification_retention_days', '30', '通知保留天数');

-- 插入平台管理员用户
INSERT INTO users (id, username, password_hash, email, phone_number, user_type, status) VALUES
('admin-001', 'admin', '$2b$10$example_hash_for_admin', 'admin@volunteer.com', '13800000001', 'platform_admin', 'active');

-- 插入组织管理员用户
INSERT INTO users (id, username, password_hash, email, phone_number, user_type, status) VALUES
('org-001', 'green_home', '$2b$10$example_hash_for_org1', 'contact@greenhome.org', '13800000002', 'organization_admin', 'active'),
('org-002', 'hope_education', '$2b$10$example_hash_for_org2', 'info@hopeedu.org', '13800000003', 'organization_admin', 'active'),
('org-003', 'sunset_care', '$2b$10$example_hash_for_org3', 'service@sunsetcare.org', '13800000004', 'organization_admin', 'active'),
('org-004', 'sunshine_rehab', '$2b$10$example_hash_for_org4', 'contact@sunshinerehab.org', '13800000005', 'organization_admin', 'active');

-- 插入志愿者用户
INSERT INTO users (id, username, password_hash, email, phone_number, user_type, status) VALUES
('vol-001', 'zhangxiaoming', '$2b$10$example_hash_for_vol1', 'zhangxm@example.com', '13800000101', 'volunteer', 'active'),
('vol-002', 'liweihua', '$2b$10$example_hash_for_vol2', 'liwh@example.com', '13800000102', 'volunteer', 'active'),
('vol-003', 'wangfang', '$2b$10$example_hash_for_vol3', 'wangf@example.com', '13800000103', 'volunteer', 'active'),
('vol-004', 'chenjie', '$2b$10$example_hash_for_vol4', 'chenj@example.com', '13800000104', 'volunteer', 'active'),
('vol-005', 'liuxiaoli', '$2b$10$example_hash_for_vol5', 'liuxl@example.com', '13800000105', 'volunteer', 'active');

-- 插入组织信息
INSERT INTO organizations (id, user_id, organization_name, unified_social_credit_code, contact_person, contact_phone, contact_email, address, description, status) VALUES
('org-001', 'org-001', '绿色家园环保协会', '91110000000000001X', '李环保', '13800000002', 'contact@greenhome.org', '北京市朝阳区环保大厦101室', '致力于环境保护和生态文明建设的公益组织', 'approved'),
('org-002', 'org-002', '希望之光教育基金会', '91110000000000002X', '王教育', '13800000003', 'info@hopeedu.org', '河北省承德市教育路88号', '专注于贫困地区教育支持的慈善基金会', 'approved'),
('org-003', 'org-003', '夕阳红志愿服务队', '91110000000000003X', '张关爱', '13800000004', 'service@sunsetcare.org', '上海市浦东新区养老服务中心', '为老年人提供关爱服务的志愿组织', 'approved'),
('org-004', 'org-004', '阳光康复中心', '91110000000000004X', '陈康复', '13800000005', 'contact@sunshinerehab.org', '广州市天河区康复医院附楼', '专业的残障人士康复服务机构', 'approved');

-- 插入志愿者信息
INSERT INTO volunteers (id, user_id, real_name, gender, date_of_birth, region, skills, interests, bio, total_service_hours, verification_status) VALUES
('vol-001', 'vol-001', '张小明', 'male', '1995-03-15', '北京市朝阳区', 
 JSON_ARRAY('教学经验', '心理咨询', '翻译能力'), 
 JSON_ARRAY('教育支教', '儿童关爱', '文化传承'), 
 '热爱公益事业，希望用自己的专业知识帮助更多人', 156.50, 'verified'),

('vol-002', 'vol-002', '李伟华', 'male', '1988-07-22', '上海市浦东新区', 
 JSON_ARRAY('医护知识', '急救技能', '沟通能力'), 
 JSON_ARRAY('医疗健康', '养老服务', '应急救援'), 
 '医学专业背景，愿意为社会健康事业贡献力量', 203.25, 'verified'),

('vol-003', 'vol-003', '王芳', 'female', '1992-11-08', '广州市天河区', 
 JSON_ARRAY('艺术才能', '组织协调', '计算机技能'), 
 JSON_ARRAY('文化传承', '儿童关爱', '社区服务'), 
 '艺术专业毕业，喜欢与孩子们互动，传递美的力量', 89.75, 'verified'),

('vol-004', 'vol-004', '陈杰', 'male', '1990-05-12', '成都市武侯区', 
 JSON_ARRAY('体育运动', '急救技能', '组织协调'), 
 JSON_ARRAY('应急救援', '体育健身', '社区服务'), 
 '体育教练，身体素质好，乐于参与各种志愿活动', 134.00, 'verified'),

('vol-005', 'vol-005', '刘小丽', 'female', '1993-09-25', '西安市雁塔区', 
 JSON_ARRAY('心理咨询', '文化知识', '沟通能力'), 
 JSON_ARRAY('心理健康', '文化传承', '教育支教'), 
 '心理学专业，关注心理健康，希望帮助更多需要心理支持的人', 67.50, 'verified');

-- 插入活动信息
INSERT INTO activities (id, organization_id, title, description, category, start_time, end_time, location, required_volunteers, current_volunteers, required_skills, status) VALUES
('act-001', 'org-001', '社区环保清洁活动', '组织志愿者清理社区垃圾，美化环境，提高居民环保意识', '环境保护', '2024-02-15 09:00:00', '2024-02-15 17:00:00', '北京市朝阳区望京社区', 20, 12, JSON_ARRAY('环保意识', '体力劳动'), 'recruiting'),

('act-002', 'org-002', '儿童教育支教活动', '为山区儿童提供课业辅导和兴趣培养，传递知识与爱心', '教育支教', '2024-02-20 08:00:00', '2024-02-20 18:00:00', '河北省承德市平泉县希望小学', 15, 8, JSON_ARRAY('教学经验', '耐心细致'), 'recruiting'),

('act-003', 'org-003', '老年人关爱服务', '陪伴老年人聊天，协助日常生活，提供精神慰藉', '养老服务', '2024-02-18 14:00:00', '2024-02-18 17:00:00', '上海市浦东新区康乐养老院', 25, 15, JSON_ARRAY('沟通能力', '医护知识'), 'recruiting'),

('act-004', 'org-004', '残障儿童康复辅助', '协助残障儿童进行康复训练，提供心理支持和陪伴', '儿童关爱', '2024-02-22 10:00:00', '2024-02-22 16:00:00', '广州市天河区阳光康复中心', 12, 6, JSON_ARRAY('心理咨询', '康复知识'), 'recruiting'),

('act-005', 'org-001', '文化遗产保护宣传', '参与文化遗产保护宣传活动，传承中华优秀传统文化', '文化传承', '2024-02-25 09:00:00', '2024-02-25 17:00:00', '西安市雁塔区大雁塔文化广场', 30, 20, JSON_ARRAY('文化知识', '宣传能力'), 'recruiting'),

('act-006', 'org-003', '应急救援技能培训', '学习基础急救技能，提高应急处置能力', '应急救援', '2024-02-28 08:00:00', '2024-02-28 18:00:00', '成都市武侯区红十字会培训中心', 40, 25, JSON_ARRAY('急救技能', '体能要求'), 'recruiting');

-- 插入报名记录
INSERT INTO applications (id, volunteer_id, activity_id, status, application_message) VALUES
('app-001', 'vol-001', 'act-001', 'approved', '我对环保事业很感兴趣，希望能为社区环境改善贡献力量'),
('app-002', 'vol-001', 'act-002', 'approved', '我有教学经验，愿意为山区孩子们提供教育支持'),
('app-003', 'vol-002', 'act-003', 'approved', '我有医护背景，可以为老年人提供专业的健康指导'),
('app-004', 'vol-003', 'act-004', 'approved', '我喜欢和孩子们相处，希望能帮助残障儿童康复'),
('app-005', 'vol-004', 'act-006', 'approved', '我身体素质好，希望学习急救技能为社会服务'),
('app-006', 'vol-005', 'act-004', 'pending', '我有心理咨询背景，可以为孩子们提供心理支持'),
('app-007', 'vol-002', 'act-001', 'approved', '愿意参与环保活动，为绿色家园贡献力量'),
('app-008', 'vol-003', 'act-005', 'approved', '对传统文化很感兴趣，希望参与文化传承活动');

-- 插入服务记录（已完成的活动）
INSERT INTO service_records (id, application_id, volunteer_id, activity_id, check_in_time, check_out_time, service_hours, organization_rating, organization_comment, volunteer_rating, volunteer_comment) VALUES
('srv-001', 'app-002', 'vol-001', 'act-002', '2024-01-20 08:00:00', '2024-01-20 18:00:00', 10.00, 5, '张小明老师非常认真负责，孩子们都很喜欢他', 5, '非常有意义的活动，孩子们很可爱，希望还有机会参与'),
('srv-002', 'app-003', 'vol-002', 'act-003', '2024-01-15 14:00:00', '2024-01-15 17:00:00', 3.00, 4, '李伟华很专业，老人们对他的服务很满意', 4, '老人们很和蔼，但有些老人身体状况需要更多关注');

-- 插入通知消息
INSERT INTO notifications (id, user_id, type, title, content, related_id, is_read) VALUES
('not-001', 'vol-001', 'activity', '活动提醒', '您报名的"社区环保清洁活动"将于明天开始，请准时参加', 'act-001', FALSE),
('not-002', 'vol-001', 'system', '系统通知', '您的志愿服务时长已达到156小时，获得"金牌志愿者"称号', NULL, FALSE),
('not-003', 'vol-001', 'evaluation', '服务评价', '希望之光教育基金会对您的服务给出了5星好评', 'srv-001', TRUE),
('not-004', 'vol-002', 'application', '报名结果', '您报名的"老年人关爱服务"活动已通过审核', 'app-003', TRUE),
('not-005', 'vol-003', 'activity', '活动提醒', '您报名的"残障儿童康复辅助"活动将于后天开始', 'act-004', FALSE);

-- 更新活动当前志愿者数量（手动更新，因为触发器可能在数据插入时还未生效）
UPDATE activities SET current_volunteers = (
    SELECT COUNT(*) FROM applications WHERE activity_id = activities.id AND status = 'approved'
);

-- 更新志愿者总服务时长
UPDATE volunteers SET total_service_hours = (
    SELECT COALESCE(SUM(service_hours), 0) FROM service_records WHERE volunteer_id = volunteers.id
);
