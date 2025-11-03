# Sentry 集成说明（可选）

## 为什么暂时移除

`@sentry/nextjs@8.47.0` 目前不支持 Next.js 16（仅支持 13、14、15），导致依赖冲突。

## 解决方案

### 方案 1：等待 Sentry 更新（推荐）
等待 `@sentry/nextjs` 发布支持 Next.js 16 的版本后，可以重新添加：

```bash
npm install @sentry/nextjs@latest
```

### 方案 2：使用兼容方式
如果急需错误监控，可以：
1. 使用 `--legacy-peer-deps` 安装（不推荐）
2. 使用其他错误监控服务（如 LogRocket、Bugsnag）
3. 使用基础的错误日志记录

### 方案 3：手动集成
可以在 `app/error.tsx` 中添加自定义错误处理，发送到第三方服务或日志系统。

## 当前错误处理

项目已包含基础的错误边界（`app/error.tsx`），可以在生产环境中手动添加错误上报逻辑。

## 集成步骤（未来）

当 Sentry 支持 Next.js 16 后：

1. 安装依赖：`npm install @sentry/nextjs@latest`
2. 运行配置向导：`npx @sentry/wizard@latest -i nextjs`
3. 添加环境变量：`NEXT_PUBLIC_SENTRY_DSN`
4. 恢复错误边界中的 Sentry 调用

