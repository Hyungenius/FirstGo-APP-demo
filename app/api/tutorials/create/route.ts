import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { callAI, parseAIOutput, buildTutorialPrompt } from "@/lib/ai";
import { validateInput, sanitizeInput } from "@/lib/inputValidation";
import { createClient } from "@supabase/supabase-js";

// 用 service role 的 client 做缓存查询（绕过 RLS，跨用户读缓存）
function getCacheClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: Request) {
  const supabase = await getServerSupabase();
  const cacheClient = getCacheClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { input_text?: string };
  try {
    body = (await req.json()) as { input_text?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawInputText = String(body?.input_text ?? "").trim();
  if (!rawInputText) {
    return NextResponse.json({ error: "input_text is required" }, { status: 400 });
  }

  const validation = validateInput(rawInputText, {
    minLength: 2,
    maxLength: 50,
    allowSpecialChars: false,
    checkSensitiveWords: true,
  });

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error || "输入验证失败" }, { status: 400 });
  }

  const inputText = sanitizeInput(rawInputText);

  try {
    // ========== 缓存查找 ==========
    // 用 service role client 查缓存（绕过 RLS，跨用户读）
    const { data: cachedList } = await cacheClient
      .from("tutorial_instances")
      .select("id, title, description, tags, difficulty")
      .ilike("input_text", inputText)
      .order("created_at", { ascending: false })
      .limit(1);

    const cached = cachedList && cachedList.length > 0 ? cachedList[0] : null;

    let structured;
    let fromCache = false;

    if (cached) {
      // 命中缓存：用 service role client 读 steps 和 items
      const { data: cachedSteps } = await cacheClient
        .from("steps")
        .select("ord, title, summary, detail_prompt")
        .eq("tutorial_id", cached.id)
        .order("ord", { ascending: true });

      const { data: cachedItems } = await cacheClient
        .from("items")
        .select("name, qty, note")
        .eq("tutorial_id", cached.id);

      // 只有 steps 不为空才算有效缓存（防止旧的半成品数据）
      if (cachedSteps && cachedSteps.length > 0) {
        structured = {
          title: cached.title || "Untitled",
          description: cached.description || undefined,
          tags: cached.tags || undefined,
          difficulty: cached.difficulty || undefined,
          steps: (cachedSteps || []).map((s: { title: string; summary: string; detail_prompt?: string; ord: number }) => ({
            title: s.title,
            summary: s.summary,
            detail_prompt: s.detail_prompt,
          })),
          items: (cachedItems || []).map((i: { name: string; qty?: string | null; note?: string | null }) => ({
            name: i.name,
            qty: i.qty ?? undefined,
            note: i.note ?? undefined,
          })),
        };
        fromCache = true;
      } else {
        // 缓存是半成品（RLS 报错留下的空壳），跳过，调 AI
        const prompt = buildTutorialPrompt(inputText);
        const aiRaw = await callAI(prompt);
        structured = parseAIOutput(aiRaw);
      }
    } else {
      // 未命中缓存：调 AI 生成
      const prompt = buildTutorialPrompt(inputText);
      const aiRaw = await callAI(prompt);
      structured = parseAIOutput(aiRaw);
    }

    // 为当前用户创建新的 tutorial_instance（独立进度）
    const { data: tut, error: tutErr } = await supabase
      .from("tutorial_instances")
      .insert([
        {
          user_id: user.id,
          input_text: inputText,
          title: structured.title,
          description: structured.description ?? null,
          tags: structured.tags ?? null,
          difficulty: structured.difficulty ?? null,
          progress: 0,
          completed: false,
        },
      ])
      .select()
      .single();

    if (tutErr || !tut) {
      return NextResponse.json({ error: tutErr?.message ?? "insert failed" }, { status: 500 });
    }

    const tutorialId = tut.id as string;

    // insert steps
    if (structured.steps?.length) {
      const stepsRows = structured.steps.map((s, idx) => ({
        tutorial_id: tutorialId,
        ord: idx + 1,
        title: s.title,
        summary: s.summary,
        detail_prompt: s.detail_prompt ?? null,
        completed: false,
      }));

      const { error: stepsErr } = await supabase.from("steps").insert(stepsRows);
      if (stepsErr) {
        return NextResponse.json({ error: stepsErr.message }, { status: 500 });
      }
    }

    // insert items
    if (structured.items?.length) {
      const itemsRows = structured.items.map((i) => ({
        tutorial_id: tutorialId,
        name: i.name,
        qty: i.qty ?? null,
        note: i.note ?? null,
      }));
      const { error: itemsErr } = await supabase.from("items").insert(itemsRows);
      if (itemsErr) {
        return NextResponse.json({ error: itemsErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ tutorialId, from_cache: fromCache }, { status: 201 });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Internal Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
