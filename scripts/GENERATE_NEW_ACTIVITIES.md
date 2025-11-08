# 预生成新增11个活动的教程

## 新增活动列表

新增了以下11个活动需要预生成教程：
- 潜水
- 滑板
- 街舞
- 跳伞
- 泡温泉
- 约会
- 针织
- 冲浪
- 爬山
- 实习
- 游泳

## 方法1：使用 API 端点（推荐）

### 步骤：

1. **调用预生成 API**：
   ```bash
   curl -X POST http://localhost:3000/api/admin/init-pre-generated
   ```
   
   或者使用浏览器访问：
   ```
   POST http://localhost:3000/api/admin/init-pre-generated
   ```

2. **查看结果**：
   API 会返回 JSON 响应，包含：
   - `total`: 总活动数（21个）
   - `generated`: 新生成的数量
   - `skipped`: 已存在跳过的数量
   - `failed`: 失败的数量
   - `results`: 详细结果
   - `errors`: 错误列表

### 注意事项：

- API 会自动跳过已存在的活动
- 分批处理，每次3个，避免API限流
- 批次之间有2秒延迟

## 方法2：使用脚本

### 步骤：

1. **运行脚本**：
   ```bash
   npx tsx scripts/init-pre-generated-tutorials.ts
   ```

2. **查看输出**：
   脚本会显示详细的处理过程和统计信息

### 环境变量要求：

确保 `.env.local` 文件中包含：
```
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase URL
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase Service Role Key
```

## 方法3：使用批量预生成 API

### 步骤：

1. **调用批量预生成 API**：
   ```bash
   curl -X PUT http://localhost:3000/api/tutorials/pre-generate \
     -H "Content-Type: application/json" \
     -d '{
       "activities": [
         "潜水", "滑板", "街舞", "跳伞", "泡温泉",
         "约会", "针织", "冲浪", "爬山", "实习", "游泳"
       ]
     }'
   ```

2. **查看结果**：
   返回每个活动的生成状态

## 验证

生成完成后，可以：

1. **检查数据库**：
   ```sql
   SELECT input_text, title, created_at 
   FROM pre_generated_tutorials 
   WHERE input_text IN (
     '潜水', '滑板', '街舞', '跳伞', '泡温泉',
     '约会', '针织', '冲浪', '爬山', '实习', '游泳'
   )
   ORDER BY created_at DESC;
   ```

2. **测试创建教程**：
   在首页点击这些活动，应该可以立即创建教程，无需等待AI生成

## 说明

- ✅ 预生成后，用户选择这些活动时可以立即创建教程
- ✅ 提升用户体验，减少等待时间
- ✅ 降低 AI API 调用成本
- ✅ 如果活动已存在，会自动跳过，不会重复生成

