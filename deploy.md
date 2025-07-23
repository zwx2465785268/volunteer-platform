# 🚀 智能志愿者平台部署指南

## 方案一：Vercel + PlanetScale (推荐)

### 1. 准备数据库 (PlanetScale)

1. 访问 [PlanetScale](https://planetscale.com/) 注册账户
2. 创建新数据库：
   - Database name: `volunteer-platform`
   - Region: 选择离您最近的区域
3. 获取连接信息：
   - 点击 "Connect" 按钮
   - 选择 "Node.js" 
   - 复制连接字符串

### 2. 部署到Vercel

1. 访问 [Vercel](https://vercel.com/) 并登录
2. 点击 "New Project"
3. 导入您的GitHub仓库：`zwx2465785268/volunteer-platform`
4. 配置环境变量：

```env
# 数据库配置 (从PlanetScale获取)
DATABASE_URL=mysql://username:password@host/database?sslaccept=strict

# JWT密钥 (生成一个随机字符串)
JWT_SECRET=your-super-secret-jwt-key-here

# 可选：AI功能
OPENAI_API_KEY=your-openai-api-key
```

5. 点击 "Deploy"

### 3. 初始化数据库

部署成功后，需要在PlanetScale中执行数据库初始化：

1. 在PlanetScale控制台中，点击 "Console"
2. 复制并执行 `scripts/create-database.sql` 中的SQL语句
3. 可选：执行 `scripts/seed-data.sql` 插入测试数据

## 方案二：Railway (一站式部署)

### 1. 部署到Railway

1. 访问 [Railway](https://railway.app/) 并登录
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择您的仓库：`zwx2465785268/volunteer-platform`

### 2. 添加MySQL数据库

1. 在Railway项目中点击 "New Service"
2. 选择 "Database" → "MySQL"
3. 等待数据库创建完成

### 3. 配置环境变量

在Railway项目设置中添加：

```env
# 数据库配置 (Railway自动提供)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}

# JWT密钥
JWT_SECRET=your-super-secret-jwt-key-here
```

### 4. 初始化数据库

1. 在Railway MySQL服务中，点击 "Connect"
2. 使用提供的连接信息连接数据库
3. 执行初始化脚本

## 方案三：Supabase + Vercel

### 1. 创建Supabase项目

1. 访问 [Supabase](https://supabase.com/) 注册
2. 创建新项目
3. 在SQL编辑器中执行数据库脚本（需要转换为PostgreSQL语法）

### 2. 部署到Vercel

与方案一相同，但使用Supabase的PostgreSQL连接字符串。

## 🔧 部署后配置

### 默认管理员账户

如果使用了测试数据，默认账户为：
- 管理员：`admin` / `password`
- 志愿者：`zwx` / `password`

### 安全建议

1. 修改默认密码
2. 设置强JWT密钥
3. 配置HTTPS
4. 设置环境变量保护

## 🚨 常见问题

### 数据库连接失败
- 检查环境变量是否正确
- 确认数据库服务是否启动
- 检查网络连接

### 构建失败
- 检查Node.js版本（推荐18+）
- 确认所有依赖已安装
- 查看构建日志

### 功能异常
- 检查API路由是否正确
- 确认数据库表结构完整
- 查看服务器日志

## 📞 获取帮助

如果遇到问题，请：
1. 查看部署平台的日志
2. 检查GitHub Issues
3. 联系技术支持
