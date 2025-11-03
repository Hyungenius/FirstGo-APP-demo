import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";

export async function GET() {
  const supabase = await getServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 获取用户的所有勋章，关联 badges 表获取详细信息
  const { data, error } = await supabase
    .from("user_badges")
    .select(
      "id, awarded_at, source_tutorial, badge_id, badges:badge_id (id, key, title, description, icon_url)"
    )
    .eq("user_id", user.id)
    .order("awarded_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ badges: data ?? [] });
}

