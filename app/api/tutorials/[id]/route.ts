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

export async function DELETE(_req: Request, ctx: RouteParams) {
  const supabase = await getServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = "then" in ctx.params ? await ctx.params : ctx.params;
  const tutorialId = resolvedParams?.id as string;
  if (!tutorialId) return NextResponse.json({ error: "id required" }, { status: 400 });

  // 检查教程是否存在且属于当前用户（RLS 保护）
  const { data: tutorial, error: checkErr } = await supabase
    .from("tutorial_instances")
    .select("id, user_id")
    .eq("id", tutorialId)
    .single();

  if (checkErr || !tutorial) {
    return NextResponse.json({ error: "教程不存在" }, { status: 404 });
  }

  // 先更新相关的 user_badges 记录，将 source_tutorial 设置为 null
  // 这样可以保留用户的勋章记录，只是断开与教程的关联
  // 如果数据库已经设置了 ON DELETE SET NULL，这步可以省略，但保留它可以确保兼容性
  const { error: updateErr } = await supabase
    .from("user_badges")
    .update({ source_tutorial: null })
    .eq("source_tutorial", tutorialId);

  // 即使更新失败也继续删除教程（如果数据库已设置 ON DELETE SET NULL，删除时会自动处理）
  if (updateErr) {
    console.warn("更新 user_badges 失败，继续删除教程:", updateErr.message);
  }

  // 删除教程（由于设置了 on delete cascade，相关的 steps 和 items 会自动删除）
  // 如果数据库已设置 ON DELETE SET NULL，user_badges 的 source_tutorial 会自动设置为 null
  const { error: deleteErr } = await supabase
    .from("tutorial_instances")
    .delete()
    .eq("id", tutorialId);

  if (deleteErr) {
    // 检查是否是外键约束错误
    if (deleteErr.message.includes("foreign key constraint")) {
      return NextResponse.json({ 
        error: "无法删除教程：存在关联的勋章记录。请先运行数据库迁移脚本修复外键约束。" 
      }, { status: 500 });
    }
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: tutorialId });
}
