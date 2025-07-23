# 智能志愿者平台

一个基于 Next.js 和 TypeScript 构建的现代化志愿者管理平台，提供志愿者注册、活动管理、智能推荐等功能。

## 🚀 功能特性

### 用户功能
- **多角色支持**: 志愿者、机构管理员、平台管理员
- **用户认证**: 注册、登录、JWT认证
- **个人资料管理**: 完整的用户信息编辑功能

### 志愿者功能
- **活动浏览**: 查看所有可用的志愿活动
- **智能推荐**: 基于地区和兴趣的活动推荐
- **活动申请**: 在线申请参与志愿活动
- **服务记录**: 跟踪志愿服务时长和历史

### 管理功能
- **活动管理**: 创建、编辑、发布志愿活动
- **用户管理**: 管理平台用户和权限
- **数据统计**: 活动参与度和用户活跃度统计

### 智能功能
- **AI助手**: 集成智能对话助手
- **个性化推荐**: 基于用户偏好的活动推荐算法

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15.2.4 (App Router)
- **语言**: TypeScript
- **UI库**: Radix UI + Tailwind CSS
- **状态管理**: React Context + Hooks
- **表单处理**: React Hook Form

### 后端
- **API**: Next.js API Routes
- **数据库**: MySQL
- **认证**: JWT
- **密码加密**: bcrypt

### 开发工具
- **包管理**: pnpm
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript

## 📦 安装和运行

### 环境要求
- Node.js 18+
- MySQL 8.0+
- pnpm (推荐) 或 npm

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd volunteer-platform
```

### 2. 安装依赖
```bash
pnpm install
```

### 3. 环境配置
创建 `.env.local` 文件：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=zyz

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# AI功能配置（可选）
OPENAI_API_KEY=your_openai_api_key
```

### 4. 数据库初始化
```bash
# 创建数据库结构
pnpm run init-db

# 插入测试数据（可选）
pnpm run init-db --seed
```

### 5. 启动开发服务器
```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── dashboard/         # 用户仪表板
│   ├── activities/        # 活动页面
│   └── admin/            # 管理后台
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   └── volunteer/        # 志愿者相关组件
├── lib/                  # 工具库
├── scripts/              # 数据库脚本
└── public/               # 静态资源
```

## 🔐 默认账户

开发环境默认账户（使用 `--seed` 参数时）：

- **平台管理员**: `admin` / `password`
- **志愿者**: `zwx` / `password`
- **机构管理员**: `green_home` / `password`

## 🚀 部署

### 生产构建
```bash
pnpm build
pnpm start
```

### 环境变量
确保在生产环境中设置所有必要的环境变量。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请通过 GitHub Issues 联系。
