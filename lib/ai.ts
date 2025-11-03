export interface AiItem {
  name: string;
  qty?: string;
  note?: string;
}

export interface AiStep {
  title: string;
  summary: string;
  detail_prompt?: string;
}

export interface AiTutorialStructured {
  title: string;
  description?: string;
  items: AiItem[];
  steps: AiStep[];
  tags?: string[];
  difficulty?: string;
}

export function buildTutorialPrompt(inputText: string): string {
  const trimmed = (inputText ?? "").trim();
  return [
    "You are an assistant that designs first-time step-by-step tutorials.",
    "Return STRICT JSON only with keys: title, description, items[], steps[], tags[], difficulty.",
    "Constraints:",
    "- steps length should be 6-7",
    "- each step has title, summary and optional detail_prompt",
    "- items are concise and practical",
    "- difficulty in {easy, medium, hard}",
    "Language: Chinese-Simplified",
    "User input:",
    trimmed || "第一次去健身房",
  ].join("\n");
}

export function parseAIOutput(resp: unknown): AiTutorialStructured {
  if (!resp || typeof resp !== "object") {
    throw new Error("AI 输出无效：不是对象");
  }
  const r = resp as any;
  const title = typeof r.title === "string" && r.title.trim() ? r.title.trim() : "Untitled";
  const description = typeof r.description === "string" ? r.description : undefined;

  const itemsSrc: any[] = Array.isArray(r.items) ? r.items : [];
  const items: AiItem[] = itemsSrc
    .filter((it) => it && typeof it === "object")
    .map((it) => ({
      name: String(it.name ?? "").trim(),
      qty: typeof it.qty === "string" ? it.qty : undefined,
      note: typeof it.note === "string" ? it.note : undefined,
    }))
    .filter((it) => it.name.length > 0)
    .slice(0, 12);

  const stepsSrc: any[] = Array.isArray(r.steps) ? r.steps : [];
  const steps: AiStep[] = stepsSrc
    .filter((st) => st && typeof st === "object")
    .map((st) => ({
      title: String(st.title ?? "").trim(),
      summary: String(st.summary ?? "").trim(),
      detail_prompt: typeof st.detail_prompt === "string" ? st.detail_prompt : undefined,
    }))
    .filter((st) => st.title.length > 0 && st.summary.length > 0);

  // 约束：6–7 步，若不足用占位补齐，不超过 7 步
  const minSteps = 6;
  const maxSteps = 7;
  const normalizedSteps = steps.slice(0, maxSteps);
  while (normalizedSteps.length < minSteps) {
    normalizedSteps.push({ title: `步骤 ${normalizedSteps.length + 1}`, summary: "待补充" });
  }

  const tags: string[] | undefined = Array.isArray(r.tags)
    ? r.tags.map((t: any) => String(t)).filter(Boolean).slice(0, 8)
    : undefined;
  const difficulty = typeof r.difficulty === "string" ? r.difficulty : undefined;

  return { title, description, items, steps: normalizedSteps, tags, difficulty };
}

/**
 * 仅用于开发阶段的伪实现：返回固定教程结构
 * 注意：真实实现只应在 Server 环境调用第三方 AI
 */
export async function callAI(prompt: string): Promise<AiTutorialStructured> {
  // 模拟网络耗时
  await new Promise((r) => setTimeout(r, 200));

  return {
    title: "第一次去健身房：入门 7 步",
    description: "为完全新手准备的健身房第一次指南，覆盖装备、热身到收尾。",
    items: [
      { name: "运动服" },
      { name: "运动鞋" },
      { name: "水瓶", qty: "1" },
      { name: "毛巾", qty: "1" }
    ],
    steps: [
      { title: "办理入场与储物", summary: "前台登记，了解器械区域，放好随身物。", detail_prompt: "扩写储物与馆内导览注意事项" },
      { title: "全身动态热身", summary: "5–8 分钟，唤醒关节与心肺。", detail_prompt: "提供逐步热身动作与次数" },
      { title: "器械熟悉与空杆练习", summary: "掌握动作轨迹与呼吸节奏。", detail_prompt: "列出 3 个基础器械与起始重量建议" },
      { title: "下肢基础动作", summary: "腿举或深蹲机，2×12。", detail_prompt: "给出姿势要点与常见错误" },
      { title: "上肢推拉动作", summary: "胸推与划船，各 2×12。", detail_prompt: "说明握距与肩胛控制" },
      { title: "核心训练", summary: "平板支撑 3×20–30 秒。", detail_prompt: "如何呼吸与骨盆中立" },
      { title: "拉伸与放松", summary: "全身拉伸 5 分钟，记录体感。", detail_prompt: "提供 4 个拉伸动作与时间" }
    ],
    tags: ["健身", "新手", "第一次"],
    difficulty: "easy"
  };
}


