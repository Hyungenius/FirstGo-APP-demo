import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import type { RouteParamsWithStep } from "@/types/route";

export async function PATCH(req: Request, ctx: RouteParamsWithStep) {
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

  let body: { completed?: boolean; timestamp?: string };
  try {
    body = (await req.json()) as { completed?: boolean; timestamp?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const completed = Boolean(body?.completed);
  const timestamp = typeof body?.timestamp === "string" ? body.timestamp : null;

  // 仅更新该用户所属 tutorial 的该 step；RLS 保护将阻止越权
  const { data, error } = await supabase
    .from("steps")
    .update({
      completed,
      completed_at: completed ? (timestamp ?? new Date().toISOString()) : null,
    })
    .eq("id", stepId)
    .eq("tutorial_id", tutorialId)
    .select("id, completed, completed_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 更新教程的进度：计算已完成步骤数 / 总步骤数
  const { data: allSteps, error: stepsError } = await supabase
    .from("steps")
    .select("id, completed")
    .eq("tutorial_id", tutorialId);

  if (stepsError) {
    console.error("Failed to fetch steps for progress calculation:", stepsError);
    // 即使计算进度失败，也返回步骤更新成功
    return NextResponse.json({ step: data });
  }

  const totalSteps = allSteps?.length || 0;
  const completedSteps = allSteps?.filter((s) => s.completed).length || 0;
  const progress = totalSteps > 0 ? completedSteps / totalSteps : 0;

  // 更新 tutorial_instances 的 progress 字段
  const { error: progressError } = await supabase
    .from("tutorial_instances")
    .update({ progress })
    .eq("id", tutorialId);

  if (progressError) {
    console.error("Failed to update tutorial progress:", progressError);
    // 即使更新进度失败，也返回步骤更新成功
  }

  return NextResponse.json({ step: data });
}


