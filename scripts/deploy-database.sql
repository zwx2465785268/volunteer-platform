-- 智能志愿者平台 - 生产环境数据库初始化脚本
-- 适用于 PlanetScale 或其他云MySQL数据库

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    user_type ENUM('volunteer', 'organization_admin', 'platform_admin') NOT NULL,
    status ENUM('active', 'inactive', 'pending_verification') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status)
);

-- 志愿者信息表
CREATE TABLE IF NOT EXISTS volunteers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
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

-- 组织表
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    organization_name VARCHAR(100) NOT NULL,
    unified_social_credit_code VARCHAR(18) UNIQUE,
    contact_person VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    address TEXT,
    description TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_organization_name (organization_name),
    INDEX idx_status (status)
);

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    required_volunteers INT NOT NULL DEFAULT 1,
    current_volunteers INT DEFAULT 0,
    required_skills JSON,
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_organization_id (organization_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time),
    INDEX idx_category (category),
    INDEX idx_location (location)
);

-- 申请表
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    volunteer_id VARCHAR(36) NOT NULL,
    activity_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    application_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_message TEXT,
    review_message TEXT,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_volunteer_activity (volunteer_id, activity_id),
    INDEX idx_volunteer_id (volunteer_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_status (status)
);

-- 服务记录表
CREATE TABLE IF NOT EXISTS service_records (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    volunteer_id VARCHAR(36) NOT NULL,
    activity_id INT NOT NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    service_hours DECIMAL(5,2) DEFAULT 0.00,
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
    INDEX idx_check_in_time (check_in_time)
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key)
);

-- 插入系统配置
INSERT IGNORE INTO system_configs (config_key, config_value, description) VALUES
('platform_name', '智能志愿者平台', '平台名称'),
('max_volunteers_per_activity', '100', '单个活动最大志愿者数量'),
('service_hour_calculation', 'auto', '服务时长计算方式'),
('notification_retention_days', '30', '通知保留天数');

-- 创建默认管理员账户 (密码: password)
INSERT IGNORE INTO users (id, username, password_hash, email, phone_number, user_type, status) VALUES
('admin-001', 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@volunteer.com', '13800000001', 'platform_admin', 'active');

-- 数据库初始化完成
SELECT 'Database initialized successfully!' as message;
