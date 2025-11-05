import OpenAI from "openai";

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

interface RawAIResponse {
  title?: unknown;
  description?: unknown;
  items?: unknown[];
  steps?: unknown[];
  tags?: unknown[];
  difficulty?: unknown;
}

export function parseAIOutput(resp: unknown): AiTutorialStructured {
  if (!resp || typeof resp !== "object") {
    throw new Error("AI 输出无效：不是对象");
  }
  const r = resp as RawAIResponse;
  const title = typeof r.title === "string" && r.title.trim() ? r.title.trim() : "Untitled";
  const description = typeof r.description === "string" ? r.description : undefined;

  const itemsSrc: unknown[] = Array.isArray(r.items) ? r.items : [];
  const items: AiItem[] = itemsSrc
    .map((it) => {
      // 支持字符串数组格式（新格式）
      if (typeof it === "string") {
        return { name: it.trim() };
      }
      // 支持对象格式（向后兼容）
      if (it && typeof it === "object") {
        const item = it as Record<string, unknown>;
        return {
          name: String(item.name ?? "").trim(),
          qty: typeof item.qty === "string" ? item.qty : undefined,
          note: typeof item.note === "string" ? item.note : undefined,
        };
      }
      return null;
    })
    .filter((it): it is AiItem => it !== null && it.name.length > 0)
    .slice(0, 12) as AiItem[];

  const stepsSrc: unknown[] = Array.isArray(r.steps) ? r.steps : [];
  const steps: AiStep[] = stepsSrc
    .filter((st) => st && typeof st === "object")
    .map((st) => {
      const step = st as Record<string, unknown>;
      return {
        title: String(step.title ?? "").trim(),
        summary: String(step.summary ?? "").trim(),
        detail_prompt: typeof step.detail_prompt === "string" ? step.detail_prompt : undefined,
      };
    })
    .filter((st) => st.title.length > 0 && st.summary.length > 0);

  // 约束：6–7 步，若不足用占位补齐，不超过 7 步
  const minSteps = 6;
  const maxSteps = 7;
  const normalizedSteps = steps.slice(0, maxSteps);
  while (normalizedSteps.length < minSteps) {
    normalizedSteps.push({ title: `步骤 ${normalizedSteps.length + 1}`, summary: "待补充" });
  }

  const tags: string[] | undefined = Array.isArray(r.tags)
    ? r.tags.map((t) => String(t)).filter(Boolean).slice(0, 8)
    : undefined;
  // 支持数字格式（1-5）或字符串格式（向后兼容）
  const difficulty = typeof r.difficulty === "number" 
    ? String(r.difficulty) 
    : typeof r.difficulty === "string" 
    ? r.difficulty 
    : undefined;

  return { title, description, items, steps: normalizedSteps, tags, difficulty };
}

/**
 * 调用 AI API 生成教程内容
 * 注意：此函数只应在 Server 环境调用
 * 
 * 当前使用：硅基流动（SiliconFlow）
 * 如需切换回 DeepSeek，请取消注释下方的 DeepSeek 代码，并注释掉硅基流动的代码
 */
export async function callAI(prompt: string): Promise<unknown> {
  // ========== 硅基流动（SiliconFlow）- 当前使用 ==========
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    throw new Error("SILICONFLOW_API_KEY 环境变量未设置");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.siliconflow.cn/v1",
  });

  try {
    const completion = await client.chat.completions.create({
      model: process.env.SILICONFLOW_MODEL || "deepseek-chat", // 可通过环境变量配置模型，默认使用 deepseek-chat
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI 返回内容为空");
    }

    // 提取JSON内容：更强大的清理逻辑
    let cleanedContent = content.trim();
    
    // 1. 移除Markdown代码块标记（包括各种变体）
    cleanedContent = cleanedContent
      .replace(/^```json\s*/i, "")
      .replace(/^```JSON\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    
    // 2. 尝试找到JSON对象的开始位置（查找第一个 '{'）
    const jsonStartIndex = cleanedContent.indexOf('{');
    if (jsonStartIndex < 0) {
      throw new Error(`AI 返回内容中未找到 JSON 对象。内容预览: ${cleanedContent.substring(0, 200)}...`);
    }
    
    // 如果JSON前有文本，只保留JSON部分
    if (jsonStartIndex > 0) {
      cleanedContent = cleanedContent.substring(jsonStartIndex);
    }
    
    // 3. 使用更智能的方法找到JSON对象的结束位置
    // 通过计算大括号的匹配来找到正确的结束位置
    let braceCount = 0;
    let jsonEndIndex = -1;
    for (let i = 0; i < cleanedContent.length; i++) {
      if (cleanedContent[i] === '{') {
        braceCount++;
      } else if (cleanedContent[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          jsonEndIndex = i;
          break;
        }
      }
    }
    
    // 如果找到了匹配的结束位置，截取JSON部分
    if (jsonEndIndex >= 0) {
      cleanedContent = cleanedContent.substring(0, jsonEndIndex + 1);
    } else {
      // 如果没找到匹配的结束位置，尝试从后往前找最后一个 '}'
      const lastBraceIndex = cleanedContent.lastIndexOf('}');
      if (lastBraceIndex > jsonStartIndex) {
        cleanedContent = cleanedContent.substring(0, lastBraceIndex + 1);
      } else {
        throw new Error(`AI 返回的 JSON 格式不完整。内容预览: ${cleanedContent.substring(0, 200)}...`);
      }
    }
    
    cleanedContent = cleanedContent.trim();
    
    try {
      const parsed = JSON.parse(cleanedContent);
      return parsed;
    } catch (parseError) {
      // 如果解析失败，尝试修复常见的JSON格式问题
      // 例如：未加引号的字符串值
      let fixedContent = cleanedContent;
      
      // 尝试修复常见的JSON格式错误
      // 1. 修复未加引号的字符串值（在冒号后面）
      fixedContent = fixedContent.replace(/:\s*([^"{\[,\n}]+?)([,}\n])/g, (match, value, suffix) => {
        // 如果是数字、布尔值或null，不处理
        if (/^(true|false|null|\d+\.?\d*)$/.test(value.trim())) {
          return match;
        }
        // 如果是已加引号的字符串，不处理
        if (value.trim().startsWith('"') && value.trim().endsWith('"')) {
          return match;
        }
        // 否则添加引号
        return `: "${value.trim()}"${suffix}`;
      });
      
      try {
        return JSON.parse(fixedContent);
      } catch (secondParseError) {
        // 如果修复后仍然失败，返回详细错误信息
        const preview = cleanedContent.substring(0, 300);
        const errorPos = cleanedContent.indexOf('针');
        const contextStart = Math.max(0, errorPos - 50);
        const contextEnd = Math.min(cleanedContent.length, errorPos + 50);
        const errorContext = cleanedContent.substring(contextStart, contextEnd);
        
        throw new Error(
          `AI 返回的 JSON 解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}. ` +
          `错误位置上下文: ...${errorContext}... ` +
          `完整内容预览: ${preview}...`
        );
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`调用硅基流动 API 失败: ${error.message}`);
    }
    throw new Error("调用硅基流动 API 失败: 未知错误");
  }
}

// ========== DeepSeek 实现（已保留，需要时可替换上面的硅基流动代码）==========
// 如需切换回 DeepSeek，请将上面的 callAI 函数替换为以下代码：
/*
export async function callAI(prompt: string): Promise<unknown> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com/v1",
  });

  try {
    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI 返回内容为空");
    }

    // 尝试解析 JSON 响应
    // 移除可能的 markdown 代码块标记
    const backtickPattern = new RegExp("^```json\\s*", "i");
    const backtickPattern2 = new RegExp("^```\\s*", "i");
    const backtickPattern3 = new RegExp("\\s*```$", "i");
    const cleanedContent = content.trim()
      .replace(backtickPattern, "")
      .replace(backtickPattern2, "")
      .replace(backtickPattern3, "")
      .trim();
    
    try {
      return JSON.parse(cleanedContent);
    } catch (parseError) {
      throw new Error(`AI 返回的 JSON 解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`调用 DeepSeek API 失败: ${error.message}`);
    }
    throw new Error("调用 DeepSeek API 失败: 未知错误");
  }
}
*/


