# 部署指南

## 部署到 Vercel

1. **准备工作**
   - 确保代码已推送到 GitHub
   - 在 Vercel 控制台连接你的 GitHub 仓库

2. **环境变量配置**
   在 Vercel 项目设置中添加以下环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`: 你的 Supabase 项目 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 你的 Supabase anon/public key

3. **部署步骤**
   - Vercel 会自动检测 Next.js 项目
   - 点击 "Deploy" 按钮
   - 等待构建完成

4. **Supabase 配置**
   - 确保在 Supabase 控制台已完成数据库 schema 创建
   - 确保 RLS 策略已启用
   - 确保 profiles 触发器已设置

## Supabase Cloud 设置

1. **创建项目**
   - 访问 https://supabase.com
   - 创建新项目或使用现有项目

2. **执行 SQL 脚本**
   按顺序执行以下脚本（在 Supabase SQL Editor 中）：
   - `scripts/schema.sql` - 创建表结构
   - `scripts/rls.sql` - 启用 RLS
   - `scripts/profiles_trigger.sql` - 设置触发器

3. **配置 Authentication**
   - 在 Authentication > Providers 中启用 Email
   - 根据需要配置邮箱确认设置

## 验证部署

1. 访问 Vercel 部署的 URL
2. 测试注册/登录功能
3. 创建测试教程
4. 验证数据是否正确保存到 Supabase

## 注意事项

- 确保生产环境的环境变量已正确配置
- 检查 Supabase 的 RLS 策略是否正确
- 监控 Vercel 的构建日志和错误

