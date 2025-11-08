-- 检查必要的表是否存在
-- 在运行 fix_user_badges_fk.sql 之前运行此脚本

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'tutorial_instances'
        ) THEN '✅ tutorial_instances 表存在'
        ELSE '❌ tutorial_instances 表不存在 - 请先运行 schema.sql'
    END as tutorial_instances_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_badges'
        ) THEN '✅ user_badges 表存在'
        ELSE '❌ user_badges 表不存在 - 请先运行 schema.sql'
    END as user_badges_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public'
            AND table_name = 'user_badges' 
            AND constraint_name = 'user_badges_source_tutorial_fkey'
        ) THEN '✅ 外键约束存在'
        ELSE '⚠️ 外键约束不存在'
    END as foreign_key_status;

-- 显示 user_badges 表的所有列
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_badges'
ORDER BY ordinal_position;

-- 检查 source_tutorial 列是否存在
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'user_badges' 
            AND column_name = 'source_tutorial'
        ) THEN '✅ source_tutorial 列存在'
        ELSE '❌ source_tutorial 列不存在 - 修复脚本会自动添加'
    END as source_tutorial_column_status;

