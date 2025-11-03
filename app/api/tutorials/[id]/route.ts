import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import type { RouteParams } from "@/types/route";

export async function GET(_req: Request, ctx: RouteParams) {
  const supabase = await getServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = "then" in ctx.params ? await ctx.params : ctx.params;
  const tutorialId = resolvedParams?.id as string;
  if (!tutorialId) return NextResponse.json({ error: "id required" }, { status: 400 });

  // 受 RLS 保护：只能读取自己的记录
  const { data: tutorial, error: tErr } = await supabase
    .from("tutorial_instances")
    .select("id, user_id, input_text, title, description, tags, difficulty, progress, completed, created_at, completed_at")
    .eq("id", tutorialId)
    .single();
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 404 });

  const [{ data: steps, error: sErr }, { data: items, error: iErr }] = await Promise.all([
    supabase
      .from("steps")
      .select("id, tutorial_id, ord, title, summary, detail, detail_prompt, completed, completed_at, created_at")
      .eq("tutorial_id", tutorialId)
      .order("ord", { ascending: true }),
    supabase
      .from("items")
      .select("id, tutorial_id, name, qty, note")
      .eq("tutorial_id", tutorialId),
  ]);

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

  return NextResponse.json({ tutorial, steps: steps ?? [], items: items ?? [] });
}


