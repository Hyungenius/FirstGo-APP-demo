# 修复外键约束错误

## 问题描述

删除教程时出现错误：
```
update or delete on table "tutorial_instances" violates foreign key constraint 
"user_badges_source_tutorial_fkey" on table "user_badges"
```

这是因为 `user_badges` 表的 `source_tutorial` 外键没有设置 `ON DELETE` 处理策略。

## 前置条件

**重要**：在运行修复脚本之前，请确保：

1. ✅ 已运行 `schema.sql` 创建所有必要的表
2. ✅ 表 `tutorial_instances` 和 `user_badges` 已存在
3. ✅ 你在 Supabase Dashboard 中有数据库管理员权限

如果遇到 "relation does not exist" 错误，请先运行 `schema.sql` 创建表。

## 解决方案

### 方法 1：运行迁移脚本（推荐）

在 Supabase SQL Editor 中运行 `fix_user_badges_fk.sql` 脚本：

1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. **确认表已存在**（如果不存在，先运行 `schema.sql`）
4. 复制 `scripts/fix_user_badges_fk.sql` 文件的内容
5. 粘贴到 SQL Editor 中
6. 点击运行

这个脚本会：
- ✅ 检查表是否存在（如果不存在会给出明确错误提示）
- ✅ 删除旧的外键约束
- ✅ 添加新的外键约束，使用 `ON DELETE SET NULL`
- ✅ 删除教程时，`user_badges` 的 `source_tutorial` 会自动设置为 `NULL`，保留用户的勋章记录

### 方法 2：检查表是否存在

如果遇到 "relation does not exist" 错误，先运行以下 SQL 检查表是否存在：

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tutorial_instances', 'user_badges');
```

如果表不存在，请先运行 `schema.sql` 创建表。

### 方法 3：完整的设置流程（首次设置）

如果是首次设置数据库，按以下顺序执行：

1. **运行 `schema.sql`** - 创建所有表
2. **运行 `rls.sql`** - 设置行级安全策略
3. **运行 `fix_user_badges_fk.sql`** - 修复外键约束

### 方法 4：手动执行 SQL（高级用户）

如果你已经知道如何操作，可以直接执行以下 SQL：

```sql
-- 使用 public schema 限定符
ALTER TABLE public.user_badges 
DROP CONSTRAINT IF EXISTS user_badges_source_tutorial_fkey;

ALTER TABLE public.user_badges 
ADD CONSTRAINT user_badges_source_tutorial_fkey 
FOREIGN KEY (source_tutorial) 
REFERENCES public.tutorial_instances(id) 
ON DELETE SET NULL;
```

## 验证修复

修复后，尝试删除一个教程，应该可以正常删除，不会再出现外键约束错误。

删除教程时：
- ✅ 教程记录会被删除
- ✅ 相关的 steps 和 items 会被自动删除（已有 `ON DELETE CASCADE`）
- ✅ `user_badges` 的 `source_tutorial` 会被设置为 `NULL`（保留勋章记录）

## 注意事项

- 这个修复不会删除用户的勋章记录，只是断开与教程的关联
- 如果希望删除教程时同时删除相关的勋章记录，可以使用 `ON DELETE CASCADE` 而不是 `ON DELETE SET NULL`
- 建议在生产环境执行前先在测试环境验证

