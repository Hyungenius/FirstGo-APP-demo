import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { buildTutorialPrompt, callAI, parseAIOutput } from "@/lib/ai";

export async function POST(req: Request) {
  const supabase = await getServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const inputText = String(body?.input_text ?? "").trim();
  if (!inputText) {
    return NextResponse.json({ error: "input_text is required" }, { status: 400 });
  }

  try {
    const prompt = buildTutorialPrompt(inputText);
    const aiRaw = await callAI(prompt);
    const structured = parseAIOutput(aiRaw);

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
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal Error" }, { status: 500 });
  }
}


