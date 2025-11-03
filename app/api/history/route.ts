import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";

export async function GET(req: Request) {
  const supabase = await getServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const query = supabase
    .from("tutorial_instances")
    .select(
      "id, user_id, input_text, title, description, tags, difficulty, progress, completed, created_at, completed_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [], count: count ?? 0, limit, offset });
}


