# 我的第一次 - First-Go App

一个帮助用户记录和完成“第一次”体验的应用：输入你想尝试的事，AI 即时生成个性化分步教程，完成后获得勋章。

## 功能特性

- 🎯 **AI 生成教程**：输入“我第一次想做什么”，AI 自动生成教程标题、概括说明、3-5 个关键物品、6-7 个步骤，以及标签和难度
- 🪵 **木块灵感入口**：首页从 21 个热门活动中随机展示 10 个像素木块，点击即可直接开始；点击 🎲 随时换一批
- 📖 **步骤详情按需生成**：步骤简介随教程一次性生成；进入具体步骤时才调用 AI 展开详细子任务说明，生成后存入数据库并重复使用
- ✅ **交互式完成**：右滑标记步骤完成，支持撤销
- 📊 **进度追踪**：实时显示教程完成进度
- 🏅 **勋章系统**：完成教程获得勋章；相似活动名称（如“第一次去健身房”与“健身”）会自动标准化、合并展示
- 📜 **历史记录**：查看过往所有教程及完成状态
- 🔐 **账号体系**：邮箱注册 / 登录，数据按用户通过 RLS 隔离；内置 Demo 账号可一键体验
- 🛡️ **输入校验**：对长度、特殊字符、注入特征、敏感词、重复字符与重复提交进行检查
- ⚡ **预生成热门教程**：热门活动的教程可预先批量生成并永久存入数据库，用户点击即开，同时节省 API 额度
- 🎨 **像素木作风格 UI**：基于 Tailwind CSS 的像素 + 木块质感、移动端优先界面，配合完成页与勋章墙动画

## 技术栈

- **前端**: Next.js 16 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS v4
- **后端**: Supabase (Auth + Postgres + RLS)
- **AI**: 服务端通过 OpenAI SDK 调用 DeepSeek 官方 API（`https://api.deepseek.com/v1`），模型由 `DEEPSEEK_MODEL` 指定，当前配置为 `deepseek-flash`；教程生成与步骤详情展开均使用真实模型

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
- `scripts/pre_generated_tutorials.sql`
- `scripts/rls.sql`
- `scripts/profiles_trigger.sql`

### 4.（可选）预生成热门活动教程

一次性为热门活动生成教程并永久保存，之后用户点击木块可直接读取、无需等待 AI：

```bash
npx tsx scripts/init-pre-generated-tutorials.ts
```

脚本只对数据库中尚不存在的活动调用 AI，不会重复生成。详见 [scripts/PRE_GENERATE_README.md](./scripts/PRE_GENERATE_README.md)。

### 5. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

Windows 若浏览器能连接 Supabase、Node 服务却报 `ECONNRESET` 或超时，可使用现有系统代理启动（Node 24）：

```powershell
.\scripts\start-local.ps1 -UseSystemProxy
```

访问 http://127.0.0.1:3000 。脚本仅为当前启动进程设置代理，不修改 Windows 设置。数据库仍连接 `.env.local` 中的 Supabase 云项目，未在本机另建数据库。

### 6. 登录 / 注册账号

首次打开应用需要登录，可任选一种方式：

- 点击 **“使用 Demo 账号一键进入”**（`judge@demo.com` / `demo123456`，账号不存在时会自动创建）
- 输入任意邮箱与 6 位以上密码自行注册 / 登录

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
/app                 # Next.js App Router 页面与 API 路由
/components          # React 组件
/lib                 # 工具函数（AI 调用、输入校验、Supabase 客户端等）
/types               # TypeScript 类型定义
/scripts             # SQL 脚本、预生成脚本与本地启动脚本
/public              # 像素素材、动画视频与静态预览页
/__tests__           # 测试文件
```

## 部署

- 通用部署说明：[DEPLOY.md](./DEPLOY.md)
- Vercel 部署：[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

## 许可证

MIT
