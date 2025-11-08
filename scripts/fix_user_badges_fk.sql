-- 修复 user_badges 表的外键约束
-- 将 source_tutorial 外键设置为 ON DELETE SET NULL
-- 这样删除教程时，不会删除用户的勋章记录，只是将 source_tutorial 设置为 NULL

DO $$
BEGIN
    -- 检查表是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tutorial_instances'
    ) THEN
        RAISE EXCEPTION '表 tutorial_instances 不存在。请先运行 schema.sql 创建表。';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_badges'
    ) THEN
        RAISE EXCEPTION '表 user_badges 不存在。请先运行 schema.sql 创建表。';
    END IF;

    -- 步骤 0: 检查 source_tutorial 列是否存在，如果不存在则添加
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'user_badges' 
        AND column_name = 'source_tutorial'
    ) THEN
        -- 添加 source_tutorial 列
        ALTER TABLE public.user_badges 
        ADD COLUMN source_tutorial uuid;
        RAISE NOTICE '已添加 source_tutorial 列';
    ELSE
        RAISE NOTICE 'source_tutorial 列已存在';
    END IF;

    -- 步骤 1: 检查并移除 NOT NULL 约束（如果存在）
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'user_badges' 
        AND column_name = 'source_tutorial' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.user_badges ALTER COLUMN source_tutorial DROP NOT NULL;
        RAISE NOTICE '已移除 source_tutorial 列的 NOT NULL 约束';
    ELSE
        RAISE NOTICE 'source_tutorial 列已允许 NULL';
    END IF;

    -- 步骤 2: 删除旧的外键约束
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public'
        AND table_name = 'user_badges' 
        AND constraint_name = 'user_badges_source_tutorial_fkey'
    ) THEN
        ALTER TABLE public.user_badges 
        DROP CONSTRAINT user_badges_source_tutorial_fkey;
        RAISE NOTICE '已删除旧的外键约束';
    ELSE
        RAISE NOTICE '外键约束不存在，跳过删除步骤';
    END IF;

    -- 步骤 3: 添加新的外键约束，使用 ON DELETE SET NULL
    ALTER TABLE public.user_badges 
    ADD CONSTRAINT user_badges_source_tutorial_fkey 
    FOREIGN KEY (source_tutorial) 
    REFERENCES public.tutorial_instances(id) 
    ON DELETE SET NULL;

    RAISE NOTICE '已添加新的外键约束（ON DELETE SET NULL）';
    RAISE NOTICE '完成！现在删除教程时，user_badges 的 source_tutorial 会自动设置为 NULL';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '执行失败: %', SQLERRM;
END $$;

