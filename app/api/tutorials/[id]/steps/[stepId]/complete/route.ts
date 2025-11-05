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
  return NextResponse.json({ step: data });
}


