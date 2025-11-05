import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { callAI, parseAIOutput } from "@/lib/ai";

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
    // 使用用户指定的 prompt 模板
    const prompt = `你是一个资深的生活教程助手，擅长用生活化、清晰的语言给新手提供指导。

根据用户输入的"第一次"体验："${inputText}"

请你生成一个**严格的 JSON 对象**，包含以下字段：

1.  "title": (字符串) 一个生活化、清晰的教程标题（对应用户的"总结性大标题"）。

2.  "description": (字符串) 一句概括全流程的鼓励性话语，80字以内（对应用户的"概括说明"）。

3.  "items": (字符串数组) 一个包含 3-5 个**具体、实用**的关键物品的数组。**请务必确保这个数组不是空的，并且每个物品都是一个字符串。**

4.  "steps": (对象数组) 一个包含 6-7 个步骤的**对象数组**（对应用户的"分点攻略"）。
    * 每个对象必须包含两个键：\`"title"\` (步骤标题) 和 \`"summary"\` (该步骤的简介，80字以内)。

5.  "tags": (字符串数组) 3 个相关的标签。

6.  "difficulty": (数字) 1-5 之间的难度数字。

请确保你的回答**只有**这个 JSON 对象，不要有任何其他文字或 Markdown 标记。`;

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
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Internal Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


