/**
 * 初始化预生成教程脚本
 * 一次性为所有热门活动生成教程并保存到数据库
 * 
 * 使用方法：
 * 1. 在项目根目录运行：npx tsx scripts/init-pre-generated-tutorials.ts
 * 2. 或者创建一个API路由来执行这个脚本（需要管理员权限）
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { callAI, parseAIOutput } from "../lib/ai";

// 加载环境变量
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("错误：缺少 Supabase 环境变量");
  console.error("需要：NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 热门活动列表
const activities = [
  "健身",
  "做饭", "旅行",
  "蹦极", "购物", "开车",
  "画画", "唱歌", "读书", "拼豆"
];

async function preGenerateSingle(inputText: string) {
  console.log(`\n处理活动: "${inputText}"`);

  // 检查是否已经存在
  const { data: existing } = await supabase
    .from("pre_generated_tutorials")
    .select("id, title")
    .eq("input_text", inputText)
    .single();

  if (existing) {
    console.log(`  ✓ 已存在，跳过: ${existing.title || inputText}`);
    return { success: true, skipped: true, input_text: inputText };
  }

  try {
    // 调用AI生成教程内容
    const prompt = `你是一个资深的生活教程助手，擅长用生活化、清晰的语言给新手提供指导。

根据用户输入的"第一次"体验："${inputText}"

请你生成一个**严格的 JSON 对象**，包含以下字段：

1.  "title": (字符串) 一个生活化、清晰的教程标题（对应用户的"总结性大标题"）。

2.  "description": (字符串) 一句概括全流程的鼓励性话语，80字以内（对应用户的"概括说明"）。

3.  "items": (字符串数组) 一个包含 3-5 个**具体、实用**的关键物品的数组。**请务必确保这个数组不是空的，并且每个物品都是一个字符串。**

4.  "steps": (对象数组) 一个包含 6-7 个步骤的**对象数组**（对应用户的"分点攻略"）。
    * 每个对象必须包含两个键：\`"title"\` (步骤标题) 和 \`"summary"\` (该步骤的简介，80字以内)。

5.  "tags": (字符串数组) 3 个相关的标签。

6.  "difficulty": (数字) 1-5 之间的难度数字。

请确保你的回答**只有**这个 JSON 对象，不要有任何其他文字或 Markdown 标记。

重要约束：

请你只返回一个 RFC 8259 兼容的 JSON 格式的字符串。

不要包含任何 JSON 之外的解释性文字、开场白（例如"好的，这是您要的..."）或结束语。

不要使用 Markdown 语法（例如 \`\`\`json ... \`\`\`）。

确保返回的内容可以直接被 JSON.parse() 解析。`;

    console.log(`  → 调用AI API生成教程...`);
    const aiRaw = await callAI(prompt);
    const structured = parseAIOutput(aiRaw);

    // 将steps和items存储为JSONB
    const tutorialData = {
      steps: structured.steps || [],
      items: structured.items || [],
    };

    // 插入预生成教程
    const { data: preGen, error: insertErr } = await supabase
      .from("pre_generated_tutorials")
      .insert([
        {
          input_text: inputText,
          title: structured.title,
          description: structured.description ?? null,
          tags: structured.tags ?? null,
          difficulty: structured.difficulty ?? null,
          tutorial_data: tutorialData,
        },
      ])
      .select()
      .single();

    if (insertErr || !preGen) {
      throw new Error(insertErr?.message ?? "插入预生成教程失败");
    }

    console.log(`  ✓ 成功生成: ${structured.title}`);
    return { success: true, skipped: false, input_text: inputText, id: preGen.id };
  } catch (error) {
    console.error(`  ✗ 生成失败:`, error instanceof Error ? error.message : String(error));
    return { success: false, input_text: inputText, error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("预生成教程初始化脚本");
  console.log("=".repeat(60));
  console.log(`活动数量: ${activities.length}`);
  console.log(`活动列表: ${activities.join(", ")}`);

  const results = [];
  const errors = [];

  // 分批处理，每次3个
  const batchSize = 3;
  for (let i = 0; i < activities.length; i += batchSize) {
    const batch = activities.slice(i, i + batchSize);
    console.log(`\n处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(activities.length / batchSize)}`);
    
    const batchPromises = batch.map((activity) => preGenerateSingle(activity));
    const batchResults = await Promise.all(batchPromises);

    batchResults.forEach((result) => {
      if (result.success) {
        results.push(result);
      } else {
        errors.push(result);
      }
    });

    // 批次之间稍作延迟，避免API限流
    if (i + batchSize < activities.length) {
      console.log("  等待2秒后继续...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("完成统计:");
  console.log(`  成功: ${results.length}`);
  console.log(`  跳过（已存在）: ${results.filter((r) => r.skipped).length}`);
  console.log(`  新生成: ${results.filter((r) => !r.skipped).length}`);
  console.log(`  失败: ${errors.length}`);
  if (errors.length > 0) {
    console.log("\n失败的活动:");
    errors.forEach((e) => {
      console.log(`  - ${e.input_text}: ${e.error}`);
    });
  }
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error("脚本执行失败:", error);
  process.exit(1);
});

