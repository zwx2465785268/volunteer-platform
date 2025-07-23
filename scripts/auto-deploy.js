#!/usr/bin/env node

/**
 * 智能志愿者平台 - 自动部署脚本
 * 自动化部署到 Vercel + PlanetScale
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 智能志愿者平台 - 自动部署开始...\n');

// 生成随机JWT密钥
function generateJWTSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 检查必要的工具
function checkPrerequisites() {
  console.log('📋 检查部署环境...');
  
  try {
    execSync('git --version', { stdio: 'ignore' });
    console.log('✅ Git 已安装');
  } catch (error) {
    console.error('❌ Git 未安装，请先安装 Git');
    process.exit(1);
  }

  try {
    execSync('node --version', { stdio: 'ignore' });
    console.log('✅ Node.js 已安装');
  } catch (error) {
    console.error('❌ Node.js 未安装，请先安装 Node.js');
    process.exit(1);
  }

  console.log('');
}

// 显示部署信息
function showDeploymentInfo() {
  console.log('📝 部署信息:');
  console.log('   项目名称: 智能志愿者平台');
  console.log('   GitHub仓库: https://github.com/zwx2465785268/volunteer-platform');
  console.log('   部署平台: Vercel + PlanetScale');
  console.log('   预计时间: 5-10分钟');
  console.log('');
}

// 生成环境变量
function generateEnvVars() {
  console.log('🔐 生成环境变量...');
  
  const jwtSecret = generateJWTSecret();
  
  const envContent = `# 智能志愿者平台 - 生产环境变量
# 自动生成于 ${new Date().toISOString()}

# 数据库配置 (请替换为您的 PlanetScale 连接字符串)
DATABASE_URL="mysql://username:password@host/database?sslaccept=strict"

# JWT 密钥 (已自动生成)
JWT_SECRET="${jwtSecret}"

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# 可选: OpenAI API Key (用于AI助手功能)
# OPENAI_API_KEY=your-openai-api-key
`;

  fs.writeFileSync('.env.production', envContent);
  console.log('✅ 环境变量文件已生成: .env.production');
  console.log('⚠️  请记住更新 DATABASE_URL 为您的真实数据库连接字符串');
  console.log('');
}

// 显示部署步骤
function showDeploymentSteps() {
  console.log('📋 接下来的部署步骤:');
  console.log('');
  
  console.log('1️⃣  创建 PlanetScale 数据库:');
  console.log('   • 访问: https://planetscale.com/');
  console.log('   • 创建账户并新建数据库');
  console.log('   • 数据库名称: volunteer-platform');
  console.log('   • 获取连接字符串');
  console.log('');
  
  console.log('2️⃣  初始化数据库:');
  console.log('   • 在 PlanetScale 控制台中执行 scripts/deploy-database.sql');
  console.log('   • 或使用 MySQL 客户端连接并执行脚本');
  console.log('');
  
  console.log('3️⃣  部署到 Vercel:');
  console.log('   • 访问: https://vercel.com/');
  console.log('   • 点击 "New Project"');
  console.log('   • 导入 GitHub 仓库: zwx2465785268/volunteer-platform');
  console.log('   • 配置环境变量 (使用 .env.production 中的值)');
  console.log('   • 点击 "Deploy"');
  console.log('');
  
  console.log('4️⃣  配置域名 (可选):');
  console.log('   • 在 Vercel 项目设置中添加自定义域名');
  console.log('   • 更新 NEXT_PUBLIC_APP_URL 环境变量');
  console.log('');
}

// 显示部署后配置
function showPostDeployment() {
  console.log('🎉 部署完成后的配置:');
  console.log('');
  
  console.log('✅ 默认管理员账户:');
  console.log('   用户名: admin');
  console.log('   密码: password');
  console.log('   ⚠️  请立即登录并修改密码!');
  console.log('');
  
  console.log('🔧 推荐的后续配置:');
  console.log('   • 修改默认管理员密码');
  console.log('   • 配置邮件通知服务');
  console.log('   • 设置监控和日志');
  console.log('   • 配置备份策略');
  console.log('');
  
  console.log('📚 有用的链接:');
  console.log('   • 项目文档: README.md');
  console.log('   • 部署指南: deploy.md');
  console.log('   • GitHub仓库: https://github.com/zwx2465785268/volunteer-platform');
  console.log('');
}

// 主函数
function main() {
  try {
    checkPrerequisites();
    showDeploymentInfo();
    generateEnvVars();
    showDeploymentSteps();
    showPostDeployment();
    
    console.log('🎯 自动部署脚本执行完成!');
    console.log('📞 如需帮助，请查看 deploy.md 或联系技术支持');
    
  } catch (error) {
    console.error('❌ 部署过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  generateJWTSecret,
  checkPrerequisites,
  showDeploymentInfo
};
