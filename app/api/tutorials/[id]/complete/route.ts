import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import type { RouteParams } from "@/types/route";
import { normalizeActivityName, generateBadgeKey } from "@/lib/badgeUtils";

export async function PATCH(_req: Request, ctx: RouteParams) {
  const supabase = await getServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = "then" in ctx.params ? await ctx.params : ctx.params;
  const tutorialId = resolvedParams?.id as string;
  if (!tutorialId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("tutorial_instances")
    .update({ completed: true, completed_at: now, progress: 1 })
    .eq("id", tutorialId)
    .select("id, completed, completed_at, progress, input_text")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 使用标准化后的活动名称创建勋章
  // 这样可以确保相似的活动（如"健身"和"第一次去健身房"）合并到同一个勋章
  const inputText = data?.input_text || "完成教程";
  const normalizedActivityName = normalizeActivityName(inputText);
  const badgeKey = generateBadgeKey(normalizedActivityName);
  let badgeId: string | null = null;

  // 查找是否存在该活动的勋章定义（使用标准化后的名称）
  const { data: existingBadge } = await supabase.from("badges").select("id").eq("key", badgeKey).single();

  if (existingBadge) {
    badgeId = existingBadge.id;
  } else {
    // 创建新勋章定义，使用标准化后的活动名称作为标题
    const { data: newBadge, error: badgeErr } = await supabase
      .from("badges")
      .insert([
        {
          key: badgeKey,
          title: normalizedActivityName,
          description: "完成了一个教程",
          icon_url: null,
        },
      ])
      .select("id")
      .single();
    if (badgeErr || !newBadge) {
      // 勋章创建失败不影响完成流程，仅记录
      console.error("Badge creation failed:", badgeErr);
    } else {
      badgeId = newBadge.id;
    }
  }

  // 如果勋章ID存在，为用户添加勋章（检查是否已有，避免重复）
  if (badgeId) {
    const { data: existingUserBadge } = await supabase
      .from("user_badges")
      .select("id")
      .eq("user_id", user.id)
      .eq("badge_id", badgeId)
      .single();

    if (!existingUserBadge) {
      const { error: insertError } = await supabase.from("user_badges").insert([
        {
          user_id: user.id,
          badge_id: badgeId,
          source_tutorial: tutorialId,
          awarded_at: now,
        },
      ]);
      if (insertError) {
        console.error("User badge insertion failed:", insertError);
      }
    }
  }

  return NextResponse.json({ tutorial: data }, { status: 200 });
}


