# Supabase SSR 迁移说明

## 已完成迁移

项目已从废弃的 `@supabase/auth-helpers-nextjs` 迁移到 `@supabase/ssr`。

## 更新内容

### 1. 依赖更新
- ❌ 移除：`@supabase/auth-helpers-nextjs@0.10.0`
- ✅ 添加：`@supabase/ssr@^0.5.2`

### 2. 代码更新

**lib/serverSupabase.ts**
- 从 `createRouteHandlerClient` 改为 `createServerClient`
- 使用新的 cookies API：`getAll()` 和 `setAll()`

**lib/supabaseClient.ts**
- 从 `createClientComponentClient` 改为 `createBrowserClient`
- 直接使用环境变量初始化客户端

## 安装新依赖

```bash
# 删除旧的 node_modules 和 lockfile（推荐）
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

## 验证

迁移后，请验证以下功能：
- [ ] 用户登录/注册
- [ ] 创建教程
- [ ] 步骤完成
- [ ] 历史记录查询
- [ ] 勋章查询

## 注意事项

- `@supabase/ssr` 与 Next.js 16 完全兼容
- 所有现有 API 路由无需修改，因为它们使用 `getServerSupabase()` 抽象层
- 客户端代码也无需修改，因为它们使用 `getSupabaseClient()` 抽象层

## 参考文档

- [Supabase SSR 文档](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js App Router 集成](https://supabase.com/docs/guides/auth/server-side/nextjs)

