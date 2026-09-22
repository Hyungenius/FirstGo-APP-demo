import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import OpenAI from "openai";
import type { RouteParamsWithStep } from "@/types/route";

export async function POST(_req: Request, ctx: RouteParamsWithStep) {
  const supabase = await getServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = "then" in ctx.params ? await ctx.params : ctx.params;
  const tutorialId = resolvedParams?.id as string;
  const stepId = resolvedParams?.stepId as string;
  if (!tutorialId || !stepId) {
    return NextResponse.json({ error: "id and stepId required" }, { status: 400 });
  }

  const { data: step, error: stepErr } = await supabase
    .from("steps")
    .select("id, tutorial_id, detail, title, summary")
    .eq("id", stepId)
    .eq("tutorial_id", tutorialId)
    .single();

  if (stepErr) return NextResponse.json({ error: stepErr.message }, { status: 404 });
  if (!step) return NextResponse.json({ error: "Step not found" }, { status: 404 });

  if (step.detail) {
    return NextResponse.json({ detail: step.detail });
  }

  const stepSummary = step.summary || step.title;
  const stepTitle = step.title;

  if (!stepSummary || !stepTitle) {
    return NextResponse.json({ error: "Step content not found" }, { status: 400 });
  }

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY not set" }, { status: 500 });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com/v1",
      timeout: 30 * 1000,
    });

    const model = process.env.DEEPSEEK_MODEL || "deepseek-flash";

    const prompt = `你是一个教程专家，擅长将一个步骤拆解成清晰、有条理的子任务。

请你根据以下"步骤标题"和"步骤简介"，进一步展开详细说明。

要求：
1. 必须使用"生活化"的语言。
2. 总字数控制在 300 字以内。
3. 内容必须**结构清晰**，例如：使用 **小标题 (如：**重点 1：...**)** 和 **分点 (如：* ...)** 来组织。

你需要展开的步骤是："${stepSummary}" (来自 "${stepTitle}" 步骤)。

请直接开始生成详细说明文本（不要返回 JSON，只返回文本）：`;

    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI 返回内容为空");
    }

    const detailText = content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/^```markdown\s*/i, "")
      .replace(/^```text\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const { error: updateErr } = await supabase
      .from("steps")
      .update({ detail: detailText })
      .eq("id", stepId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ detail: detailText });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "AI generation failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
