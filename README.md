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
- **AI**: 服务端通过 OpenAI SDK 调用 DeepSeek 官方 API；教程与步骤详细说明均使用真实模型，当前配置为 `deepseek-flash`

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.local.example` 为 `.env.local` 并填写：

```
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase Anon Key
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase 服务端密钥
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-flash
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

Windows 若浏览器能连接 Supabase、Node 服务却报 `ECONNRESET` 或超时，可使用现有系统代理启动（Node 24）：

```powershell
.\scripts\start-local.ps1 -UseSystemProxy
```

访问 http://127.0.0.1:3000 。脚本仅为当前启动进程设置代理，不修改 Windows 设置。数据库仍连接 `.env.local` 中的 Supabase 云项目，未在本机另建数据库。

## 动画素材

本地集中预览：[动画素材预览](http://127.0.0.1:3000/animation-preview.html)。

- 首页使用 `public/assets` 中的牛仔、木块、背包和图标 PNG。
- 完成页循环播放 `done.mp4`；勋章墙点击卡片后播放 `swim.mp4`、`sing.mp4`、`paint.mp4` 或通用 `xunzhang.mp4`。
- 原始 `done.mov` 和 `xunzhang.mov` 使用 HEVC，已保留原文件并转出 H.264 / yuv420p MP4 用于网页播放。
- 页面还包含滑动完成、进度条、加载指示和弹窗淡入/上移动画。视频画面里的浅色棋盘格来自原素材，并非网页透明背景。

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
