import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { callAI, parseAIOutput, buildTutorialPrompt } from "@/lib/ai";

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
    // 原有10个活动
    "健身",
    "做饭", "旅行",
    "蹦极", "购物", "开车",
    "画画", "唱歌", "读书", "拼豆",
    // 新增11个活动
    "潜水", "滑板", "街舞", "跳伞", "泡温泉",
    "约会", "针织", "冲浪", "爬山", "实习", "游泳"
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
      const prompt = buildTutorialPrompt(inputText);

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

