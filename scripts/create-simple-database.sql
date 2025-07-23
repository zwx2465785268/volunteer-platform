-- 智能志愿者平台数据库表结构创建脚本（简化版）

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    user_type ENUM('volunteer', 'organization_admin', 'platform_admin') NOT NULL,
    status ENUM('active', 'inactive', 'pending_verification') DEFAULT 'pending_verification',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone_number),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status)
);

-- 志愿者信息表
CREATE TABLE IF NOT EXISTS volunteers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    id_card_number VARCHAR(18) UNIQUE,
    gender ENUM('male', 'female', 'other'),
    date_of_birth DATE,
    region VARCHAR(100),
    skills JSON,
    interests JSON,
    bio TEXT,
    total_service_hours DECIMAL(10,2) DEFAULT 0.00,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_region (region),
    INDEX idx_verification_status (verification_status)
);

-- 组织信息表
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    organization_name VARCHAR(100) UNIQUE NOT NULL,
    unified_social_credit_code VARCHAR(18) UNIQUE NOT NULL,
    contact_person VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    description TEXT,
    status ENUM('approved', 'pending_review', 'rejected') DEFAULT 'pending_review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_organization_name (organization_name),
    INDEX idx_status (status)
);

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    required_volunteers INT NOT NULL DEFAULT 1,
    current_volunteers INT DEFAULT 0,
    required_skills JSON,
    status ENUM('draft', 'pending_review', 'recruiting', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_organization_id (organization_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time),
    INDEX idx_category (category)
);

-- 报名表
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id INT NOT NULL,
    activity_id INT NOT NULL,
    application_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    application_message TEXT,
    review_message TEXT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_volunteer_activity (volunteer_id, activity_id),
    INDEX idx_volunteer_id (volunteer_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_status (status)
);

-- 服务记录表
CREATE TABLE IF NOT EXISTS service_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT UNIQUE NOT NULL,
    volunteer_id INT NOT NULL,
    activity_id INT NOT NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    service_hours DECIMAL(8,2) DEFAULT 0.00,
    organization_rating INT CHECK (organization_rating >= 1 AND organization_rating <= 5),
    organization_comment TEXT,
    volunteer_rating INT CHECK (volunteer_rating >= 1 AND volunteer_rating <= 5),
    volunteer_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    INDEX idx_volunteer_id (volunteer_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_service_hours (service_hours)
);

-- 消息通知表
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('system', 'activity', 'application', 'evaluation') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入测试数据
INSERT INTO users (username, password_hash, email, phone_number, user_type, status) VALUES
('admin', '$2b$10$example_hash', 'admin@example.com', '13800000000', 'platform_admin', 'active'),
('org1', '$2b$10$example_hash', 'org1@example.com', '13800000001', 'organization_admin', 'active'),
('volunteer1', '$2b$10$example_hash', 'vol1@example.com', '13800000002', 'volunteer', 'active');

INSERT INTO organizations (user_id, organization_name, unified_social_credit_code, contact_person, contact_phone, contact_email, address, description, status) VALUES
(2, '测试慈善组织', '91110000000000001X', '张三', '13800000001', 'org1@example.com', '北京市朝阳区', '这是一个测试组织，等待审核', 'pending_review');

INSERT INTO volunteers (user_id, real_name, region, verification_status) VALUES
(3, '李四', '北京市', 'pending');

INSERT INTO activities (organization_id, title, description, start_time, end_time, location, required_volunteers, status) VALUES
(1, '测试志愿活动', '这是一个测试活动，等待审核', '2024-03-01 09:00:00', '2024-03-01 17:00:00', '北京市朝阳区', 10, 'pending_review');

INSERT INTO applications (volunteer_id, activity_id, application_message, status) VALUES
(1, 1, '我想参加这个活动', 'pending');
