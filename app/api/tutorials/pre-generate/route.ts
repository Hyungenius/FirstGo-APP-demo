import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { callAI, parseAIOutput } from "@/lib/ai";

/**
 * 预生成单个教程的内部函数
 */
async function preGenerateSingle(inputText: string) {
  const supabase = await getServerSupabase();

  // 检查是否已经存在预生成的教程
  const { data: existing } = await supabase
    .from("pre_generated_tutorials")
    .select("id")
    .eq("input_text", inputText)
    .single();

  if (existing) {
    return { 
      success: true,
      message: "预生成教程已存在",
      input_text: inputText,
      id: existing.id
    };
  }

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

  return { 
    success: true,
    message: "预生成教程成功",
    input_text: inputText,
    id: preGen.id 
  };
}

/**
 * 预生成教程API
 * 用于提前生成热门活动的教程内容，存储在 pre_generated_tutorials 表中
 * 这样用户点击木块时可以立即从数据库读取，无需等待AI API响应
 */
export async function POST(req: Request) {
  let body: { input_text?: string };
  try {
    body = (await req.json()) as { input_text?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const inputText = String(body?.input_text ?? "").trim();
  if (!inputText) {
    return NextResponse.json({ error: "input_text is required" }, { status: 400 });
  }

  try {
    const result = await preGenerateSingle(inputText);
    return NextResponse.json(result, { 
      status: result.message === "预生成教程已存在" ? 200 : 201 
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Internal Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * 批量预生成多个活动的教程
 */
export async function PUT(req: Request) {
  let body: { activities?: string[] };
  try {
    body = (await req.json()) as { activities?: string[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const activities = body?.activities || [];
  if (activities.length === 0) {
    return NextResponse.json({ error: "activities array is required" }, { status: 400 });
  }

  const results = [];
  const errors = [];

  // 分批处理所有活动（限制并发数以避免过载）
  const batchSize = 3; // 每次处理3个活动
  for (let i = 0; i < activities.length; i += batchSize) {
    const batch = activities.slice(i, i + batchSize);
    const batchPromises = batch.map(async (activity) => {
      try {
        const result = await preGenerateSingle(activity);
        return { activity, status: "success" as const, result };
      } catch (e) {
        return { 
          activity, 
          status: "error" as const, 
          error: e instanceof Error ? e.message : "Unknown error" 
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach((result) => {
      if (result.status === "success") {
        results.push(result);
      } else {
        errors.push(result);
      }
    });
  }

  return NextResponse.json({
    success: results.length,
    failed: errors.length,
    results,
    errors,
  });
}

