# Vercel 部署完整指南

## 方法一：通过 Vercel Dashboard（推荐）

### 步骤 1：准备代码
1. 确保所有代码已提交到 Git
2. 将代码推送到 GitHub 仓库

```bash
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

### 步骤 2：连接 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择你的 GitHub 仓库
5. 点击 "Import"

### 步骤 3：配置项目
Vercel 会自动检测 Next.js 项目，通常不需要修改配置。

**框架预设：** Next.js  
**根目录：** ./ （保持默认）  
**构建命令：** `npm run build` （自动检测）  
**输出目录：** `.next` （自动检测）

### 步骤 4：配置环境变量
在部署前，点击 "Environment Variables" 添加以下变量：

#### Supabase 配置
```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

#### AI API 配置（硅基流动）
```
SILICONFLOW_API_KEY=你的硅基流动API密钥
SILICONFLOW_MODEL=deepseek-chat  （可选，不设置则使用默认值）
```

### 步骤 5：部署
1. 点击 "Deploy" 按钮
2. 等待构建完成（通常需要 2-5 分钟）
3. 部署成功后，你会得到一个 URL（例如：`your-project.vercel.app`）

## 方法二：通过 Vercel CLI

### 步骤 1：安装 Vercel CLI
```bash
npm install -g vercel
```

### 步骤 2：登录 Vercel
```bash
vercel login
```

### 步骤 3：部署
```bash
# 在项目根目录执行
vercel

# 首次部署会询问一些问题：
# - Set up and deploy? [Y/n] Y
# - Which scope? 选择你的账号
# - Link to existing project? [y/N] N
# - Project name? 输入项目名称
# - Directory? ./ （保持默认）
```

### 步骤 4：配置环境变量
```bash
# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SILICONFLOW_API_KEY
vercel env add SILICONFLOW_MODEL

# 应用到生产环境
vercel env pull .env.local
```

### 步骤 5：生产环境部署
```bash
vercel --prod
```

## 部署后检查清单

### ✅ 环境变量
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 已配置
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已配置
- [ ] `SILICONFLOW_API_KEY` 已配置
- [ ] `SILICONFLOW_MODEL` 已配置（可选）

### ✅ Supabase 配置
- [ ] 数据库 schema 已创建（执行 `scripts/schema.sql`）
- [ ] RLS 策略已启用（执行 `scripts/rls.sql`）
- [ ] profiles 触发器已设置（执行 `scripts/profiles_trigger.sql`）
- [ ] Email 认证已启用

### ✅ 功能测试
- [ ] 访问部署的 URL 可以正常打开
- [ ] 注册/登录功能正常
- [ ] 创建教程功能正常
- [ ] AI 生成功能正常（检查步骤详情页）

## 常见问题

### 问题 1：构建失败
**解决方案：**
- 检查构建日志中的错误信息
- 确保 `package.json` 中的依赖都正确
- 确保 Node.js 版本兼容（Vercel 默认使用 Node.js 18.x）

### 问题 2：环境变量未生效
**解决方案：**
- 确保环境变量已添加到 Vercel 项目设置
- 重新部署项目（环境变量修改后需要重新部署）
- 检查环境变量名称是否正确（区分大小写）

### 问题 3：Supabase 连接失败
**解决方案：**
- 检查 Supabase URL 和密钥是否正确
- 确保 Supabase 项目已启用
- 检查 Supabase 的 API 设置中是否允许来自 Vercel 域名的请求

### 问题 4：AI 功能不工作
**解决方案：**
- 检查 `SILICONFLOW_API_KEY` 是否正确
- 检查 API 密钥是否有效且有足够的配额
- 查看 Vercel 函数日志中的错误信息

## 更新部署

### 自动部署（推荐）
当代码推送到 GitHub 的 main 分支时，Vercel 会自动触发部署。

### 手动部署
```bash
# 通过 CLI
vercel --prod

# 或通过 Dashboard
# 在 Vercel Dashboard 中点击 "Redeploy"
```

## 查看部署日志

### 在 Vercel Dashboard
1. 进入项目页面
2. 点击 "Deployments"
3. 选择具体的部署
4. 查看 "Build Logs" 和 "Function Logs"

### 通过 CLI
```bash
vercel logs
```

## 自定义域名

1. 在 Vercel Dashboard 中进入项目设置
2. 点击 "Domains"
3. 添加你的自定义域名
4. 按照提示配置 DNS 记录

## 性能优化建议

1. **启用 Edge Functions**（如果适用）
2. **配置缓存策略**
3. **使用 Vercel Analytics** 监控性能
4. **设置环境变量加密**（敏感信息）

---

**部署成功后，你的应用就可以通过 Vercel 提供的 URL 访问了！**

