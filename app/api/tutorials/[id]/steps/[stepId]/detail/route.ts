import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { callAI } from "@/lib/ai";

export async function GET(
  _req: Request,
  ctx:
    | { params: Promise<{ id: string; stepId: string }> }
    | { params: { id: string; stepId: string } }
) {
  const supabase = await getServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = (await (ctx as any).params) ?? (ctx as any).params;
  const tutorialId = resolvedParams?.id as string;
  const stepId = resolvedParams?.stepId as string;
  if (!tutorialId || !stepId) {
    return NextResponse.json({ error: "id and stepId required" }, { status: 400 });
  }

  // 读取 step，检查是否已有 detail
  const { data: step, error: stepErr } = await supabase
    .from("steps")
    .select("id, tutorial_id, detail, detail_prompt, title")
    .eq("id", stepId)
    .eq("tutorial_id", tutorialId)
    .single();

  if (stepErr) return NextResponse.json({ error: stepErr.message }, { status: 404 });
  if (!step) return NextResponse.json({ error: "Step not found" }, { status: 404 });

  // 如果已有 detail，直接返回
  if (step.detail) {
    return NextResponse.json({ detail: step.detail });
  }

  // 如果没有 detail_prompt，无法生成
  if (!step.detail_prompt) {
    return NextResponse.json({ error: "detail_prompt not found" }, { status: 400 });
  }

  // 调用 AI 生成 detail（目前是 mock）
  try {
    const prompt = `请为以下步骤生成详细的说明，要求分点、清晰、实用：\n${step.detail_prompt}`;
    const aiResp = await callAI(prompt);
    // mock 返回的是一个教程结构，这里我们用一个简单的占位文本
    // 实际实现中，AI 应该返回纯文本的 detail
    const detailText = `这是步骤“${step.title}”的详细说明。\n\n${aiResp.description || ""}\n\n提示：${step.detail_prompt}`;

    // 保存到数据库
    const { error: updateErr } = await supabase
      .from("steps")
      .update({ detail: detailText })
      .eq("id", stepId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ detail: detailText });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "AI generation failed" }, { status: 500 });
  }
}

