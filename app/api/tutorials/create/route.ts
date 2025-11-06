import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { callAI, parseAIOutput, buildTutorialPrompt } from "@/lib/ai";

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

  const inputText = String(body?.input_text ?? "").trim();
  if (!inputText) {
    return NextResponse.json({ error: "input_text is required" }, { status: 400 });
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


