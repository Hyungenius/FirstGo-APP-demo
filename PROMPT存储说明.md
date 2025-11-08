# Prompt 存储位置说明

本文档说明项目中所有 prompt 的存储位置和使用方式。

---

## 📍 Prompt 存储位置总览

### 1. **主要 Prompt 模板** - 硬编码在代码中

**位置**：`lib/ai.ts` 文件中的 `buildTutorialPrompt` 函数

**代码位置**：
```28:60:lib/ai.ts
export function buildTutorialPrompt(inputText: string): string {
  const trimmed = (inputText ?? "").trim();
  return `你是一个资深的生活教程助手，擅长用生活化、清晰的语言给新手提供指导。

根据用户输入的"第一次"体验："${trimmed}"

请你生成一个**严格的 JSON 对象**，包含以下字段：
...
`;
}
```

**用途**：
- 用于生成整个教程的结构化内容（标题、描述、步骤、物品等）
- 在创建教程时调用，生成 6-7 个步骤的教程

**调用位置**：
- `app/api/tutorials/create/route.ts` - 创建教程时
- `app/api/tutorials/pre-generate/route.ts` - 预生成教程时
- `app/api/admin/init-pre-generated/route.ts` - 初始化预生成教程时

**特点**：
- ✅ 这是**主要的 prompt 模板**，硬编码在代码中
- ✅ 修改 prompt 需要修改代码并重新部署
- ❌ 不存储在数据库中

---

### 2. **步骤详情 Prompt** - 存储在数据库

**位置**：`steps` 表的 `detail_prompt` 字段

**数据库 Schema**：
```sql
create table if not exists steps (
  id uuid primary key default gen_random_uuid(),
  tutorial_id uuid references tutorial_instances(id) on delete cascade,
  ord int not null,
  title text,
  summary text,
  detail text,
  detail_prompt text,  -- 👈 这里存储步骤详情生成的 prompt
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);
```

**用途**：
- 用于生成单个步骤的详细说明
- 每个步骤可以有自己的 `detail_prompt`

**当前状态**：
- ⚠️ 数据库表中有这个字段
- ⚠️ 但在当前代码中**似乎没有被实际使用**
- 代码中生成步骤详情时使用的是硬编码的 prompt（见下方）

**相关代码**：
- `app/api/tutorials/[id]/steps/[stepId]/generate-detail/route.ts` - 生成步骤详情时使用硬编码 prompt
- `app/api/tutorials/[id]/steps/[stepId]/detail/route.ts` - 检查 `detail_prompt` 但使用硬编码 prompt

---

### 3. **步骤详情生成 Prompt** - 硬编码在代码中

**位置**：`app/api/tutorials/[id]/steps/[stepId]/generate-detail/route.ts`

**代码位置**：
```58:69:app/api/tutorials/[id]/steps/[stepId]/generate-detail/route.ts
const prompt = `你是一个教程专家，擅长将一个步骤拆解成清晰、有条理的子任务。

请你根据以下"步骤标题"和"步骤简介"，进一步展开详细说明。

要求：
1. 必须使用"生活化"的语言。
2. 总字数控制在 300 字以内。
3. 内容必须**结构清晰**，例如：使用 **小标题 (如：**重点 1：...**)** 和 **分点 (如：* ...)** 来组织。

你需要展开的步骤是："${stepSummary}" (来自 "${stepTitle}" 步骤)。

请直接开始生成详细说明文本（不要返回 JSON，只返回文本）：`;
```

**用途**：
- 用于生成单个步骤的详细说明内容
- 当用户点击步骤查看详情时调用

---

### 4. **AI 响应审计表** - 数据库表（未使用）

**位置**：`ai_responses` 表

**数据库 Schema**：
```sql
create table if not exists ai_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  tutorial_id uuid references tutorial_instances(id),
  step_id uuid references steps(id),
  model text,
  prompt text,  -- 👈 可以存储实际发送的 prompt
  response jsonb,
  created_at timestamptz default now()
);
```

**当前状态**：
- ⚠️ 数据库表已创建
- ❌ **代码中没有任何地方写入这个表**
- 这个表设计用于审计和追踪 AI 调用，但目前未实现

**潜在用途**：
- 记录每次 AI 调用的 prompt 和响应
- 用于分析和优化 prompt
- 用于调试和问题排查

---

## 📊 Prompt 使用流程图

```
用户创建教程
    ↓
[lib/ai.ts] buildTutorialPrompt(inputText)
    ├─ 硬编码的 prompt 模板
    └─ 返回完整的 prompt 字符串
    ↓
调用 AI API (callAI)
    ├─ prompt 不存储，直接发送给 AI
    └─ 响应解析后存储到数据库
    ↓
存储到数据库
    ├─ tutorial_instances (教程实例)
    ├─ steps (步骤列表，包含 detail_prompt 字段但未使用)
    └─ items (物品清单)

用户查看步骤详情
    ↓
[generate-detail/route.ts] 硬编码的 prompt
    ├─ 使用步骤的 title 和 summary
    └─ 生成详细说明
    ↓
存储到 steps.detail 字段
```

---

## 🔍 如何修改 Prompt

### 修改主要教程生成 Prompt

**文件**：`lib/ai.ts`

**函数**：`buildTutorialPrompt`

**步骤**：
1. 打开 `lib/ai.ts` 文件
2. 找到 `buildTutorialPrompt` 函数（第 28 行）
3. 修改返回的字符串模板
4. 重新部署应用

**注意**：
- 修改后会影响所有新创建的教程
- 不会影响已创建的教程
- 建议先测试再部署

---

### 修改步骤详情生成 Prompt

**文件**：`app/api/tutorials/[id]/steps/[stepId]/generate-detail/route.ts`

**位置**：第 58-69 行

**步骤**：
1. 打开文件
2. 修改 `prompt` 变量的内容
3. 重新部署应用

---

## 💡 建议改进

### 1. 使用数据库存储 Prompt 模板

**当前问题**：
- Prompt 硬编码在代码中，修改需要重新部署
- 无法动态调整 prompt 而不重启服务

**建议方案**：
- 创建 `prompt_templates` 表
- 存储不同类型的 prompt 模板
- 支持版本管理和 A/B 测试

### 2. 实际使用 `steps.detail_prompt` 字段

**当前问题**：
- 数据库有 `detail_prompt` 字段但未使用
- 所有步骤使用相同的硬编码 prompt

**建议方案**：
- 在生成步骤时，为每个步骤生成个性化的 `detail_prompt`
- 存储到 `steps.detail_prompt` 字段
- 生成详情时使用存储的 `detail_prompt`

### 3. 实现 AI 响应审计

**当前问题**：
- `ai_responses` 表已创建但未使用

**建议方案**：
- 在 `callAI` 函数中记录每次调用
- 存储 prompt、响应、模型等信息
- 用于分析和优化

---

## 📝 总结

| Prompt 类型 | 存储位置 | 当前状态 | 修改方式 |
|------------|---------|---------|---------|
| 教程生成 Prompt | `lib/ai.ts` (硬编码) | ✅ 使用中 | 修改代码 |
| 步骤详情 Prompt | `generate-detail/route.ts` (硬编码) | ✅ 使用中 | 修改代码 |
| 步骤 detail_prompt | `steps.detail_prompt` (数据库) | ⚠️ 未使用 | - |
| AI 审计 prompt | `ai_responses.prompt` (数据库) | ❌ 未使用 | - |

**主要结论**：
- 当前所有实际使用的 prompt 都是**硬编码在代码中**
- 数据库中有相关字段但**未被实际使用**
- 修改 prompt 需要修改代码并重新部署

