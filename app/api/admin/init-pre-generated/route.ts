import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { callAI, parseAIOutput } from "@/lib/ai";

/**
 * 管理员API：初始化预生成教程
 * 一次性为所有热门活动生成教程并保存到数据库
 * 
 * 注意：这个API会调用AI API，建议只在部署时或手动触发一次
 * 推荐使用脚本：scripts/init-pre-generated-tutorials.ts
 */
export async function POST(_req: Request) {
  const supabase = await getServerSupabase();

  // 可选：验证管理员权限
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user || !isAdmin(user)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const activities = [
    "健身",
    "做饭", "旅行",
    "蹦极", "购物", "开车",
    "画画", "唱歌", "读书", "拼豆"
  ];

  type PreGenResult = 
    | { success: true; skipped: true; input_text: string; title: string }
    | { success: true; skipped: false; input_text: string; title: string; id: string }
    | { success: false; input_text: string; error: string };

  async function preGenerateSingle(inputText: string): Promise<PreGenResult> {
    // 检查是否已经存在
    const { data: existing } = await supabase
      .from("pre_generated_tutorials")
      .select("id, title")
      .eq("input_text", inputText)
      .single();

    if (existing) {
      return { success: true, skipped: true, input_text: inputText, title: existing.title };
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

      return { success: true, skipped: false, input_text: inputText, title: structured.title, id: preGen.id };
    } catch (error) {
      return { success: false, input_text: inputText, error: error instanceof Error ? error.message : String(error) };
    }
  }

  const results: PreGenResult[] = [];
  const errors: PreGenResult[] = [];

  // 分批处理，每次3个
  const batchSize = 3;
  for (let i = 0; i < activities.length; i += batchSize) {
    const batch = activities.slice(i, i + batchSize);
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return NextResponse.json({
    success: true,
    total: activities.length,
    generated: results.filter((r) => r.success && !r.skipped).length,
    skipped: results.filter((r) => r.success && r.skipped).length,
    failed: errors.length,
    results,
    errors,
  });
}

