import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { callAI, parseAIOutput, buildTutorialPrompt } from "@/lib/ai";
import { validateInput, sanitizeInput } from "@/lib/inputValidation";

export async function POST(req: Request) {
  const supabase = await getServerSupabase();

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

  // 输入验证
  const validation = validateInput(rawInputText, {
    minLength: 2,
    maxLength: 50,
    allowSpecialChars: false,
    checkSensitiveWords: true,
  });

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error || "输入验证失败" }, { status: 400 });
  }

  // 清理输入（防止XSS等攻击）
  const inputText = sanitizeInput(rawInputText);

  // 频率限制：检查用户最近1分钟内创建的教程数量
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("tutorial_instances")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneMinuteAgo);

  if (recentCount && recentCount >= 3) {
    return NextResponse.json(
      { error: "创建频率过高，请稍后再试（每分钟最多3次）" },
      { status: 429 }
    );
  }

  // 重复输入检查：检查用户最近5分钟内是否创建过相同内容的教程
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: recentTutorials } = await supabase
    .from("tutorial_instances")
    .select("input_text")
    .eq("user_id", user.id)
    .gte("created_at", fiveMinutesAgo);

  if (recentTutorials) {
    const normalizedInput = inputText.trim().toLowerCase();
    const isDuplicate = recentTutorials.some(
      (t) => t.input_text?.trim().toLowerCase() === normalizedInput
    );
    if (isDuplicate) {
      return NextResponse.json(
        { error: "您最近已创建过相同内容的教程，请稍后再试" },
        { status: 400 }
      );
    }
  }

  try {
    let structured: ReturnType<typeof parseAIOutput>;
    
    // 优先检查预生成的教程
    const { data: preGen } = await supabase
      .from("pre_generated_tutorials")
      .select("*")
      .eq("input_text", inputText)
      .single();

    if (preGen && preGen.tutorial_data) {
      // 使用预生成的数据
      const tutorialData = preGen.tutorial_data as {
        steps?: Array<{ title: string; summary: string; detail_prompt?: string }>;
        items?: Array<{ name: string; qty?: string; note?: string }>;
      };
      
      structured = {
        title: preGen.title || "Untitled",
        description: preGen.description || undefined,
        tags: preGen.tags || undefined,
        difficulty: preGen.difficulty || undefined,
        steps: tutorialData.steps || [],
        items: tutorialData.items || [],
      };
    } else {
      // 如果没有预生成数据，调用AI生成
      const prompt = buildTutorialPrompt(inputText);
      const aiRaw = await callAI(prompt);
      structured = parseAIOutput(aiRaw);
    }

    // create tutorial instance
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

    return NextResponse.json({ tutorialId }, { status: 201 });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Internal Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


