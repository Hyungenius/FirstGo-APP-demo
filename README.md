# 我的第一次 - First-Go App

一个帮助用户记录和完成“第一次”体验的应用，使用 AI 生成个性化教程。

## 功能特性

- 🎯 **AI 生成教程**：输入"我第一次想做什么"，AI 自动生成 6-7 步详细教程
- ✅ **交互式完成**：右滑标记步骤完成，支持撤销
- 📊 **进度追踪**：实时显示教程进度
- 🏅 **勋章系统**：完成教程获得勋章
- 📱 **历史记录**：查看过往所有教程
- 🎨 **现代 UI**：基于 Tailwind CSS，支持暗黑模式

## 技术栈

- **前端**: Next.js 16 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS v4
- **后端**: Supabase (Auth + Postgres + Realtime)
- **AI**: Server-side 调用（目前为 mock，可接入 OpenAI/其他 AI 服务）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填写：

```
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase Anon Key
```

### 3. 设置数据库

在 Supabase SQL Editor 中按顺序执行：
- `scripts/schema.sql`
- `scripts/rls.sql`
- `scripts/profiles_trigger.sql`

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 运行测试
npm test

# Lint 检查
npm run lint
```

## 项目结构

```
/app                 # Next.js App Router 页面
/components          # React 组件
/lib                 # 工具函数（AI、Supabase 等）
/types               # TypeScript 类型定义
/scripts             # SQL 脚本
/__tests__           # 测试文件
```

## 部署

详见 [DEPLOY.md](./DEPLOY.md)

## 许可证

MIT
