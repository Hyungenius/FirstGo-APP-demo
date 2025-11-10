/**
 * 输入验证工具函数
 * 用于防止垃圾输入和恶意内容
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 验证输入文本
 * @param inputText 用户输入的文本
 * @param options 验证选项
 * @returns 验证结果
 */
export function validateInput(
  inputText: string,
  options: {
    minLength?: number;
    maxLength?: number;
    allowSpecialChars?: boolean;
    checkSensitiveWords?: boolean;
  } = {}
): ValidationResult {
  const {
    minLength = 2,
    maxLength = 50,
    allowSpecialChars = false,
    checkSensitiveWords = true,
  } = options;

  // 1. 空值检查
  const trimmed = inputText.trim();
  if (!trimmed) {
    return { valid: false, error: "请输入内容" };
  }

  // 2. 长度检查
  if (trimmed.length < minLength) {
    return { valid: false, error: `输入内容太短，至少需要 ${minLength} 个字符` };
  }
  if (trimmed.length > maxLength) {
    return { valid: false, error: `输入内容太长，最多 ${maxLength} 个字符` };
  }

  // 3. 特殊字符检查（防止SQL注入、XSS等）
  if (!allowSpecialChars) {
    // 允许：中文、英文、数字、常见标点（，。！？、）
    // 禁止：SQL注入相关字符、HTML标签、脚本相关字符
    const dangerousPatterns = [
      /<script/i,
      /<\/script/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick, onerror 等
      /['";\\]/g, // SQL注入相关
      /--/g, // SQL注释
      /\/\*/g, // SQL注释
      /union\s+select/i, // SQL注入
      /drop\s+table/i, // SQL注入
      /delete\s+from/i, // SQL注入
      /insert\s+into/i, // SQL注入
      /update\s+set/i, // SQL注入
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        return { valid: false, error: "输入包含不允许的特殊字符" };
      }
    }
  }

  // 4. 敏感词检查
  if (checkSensitiveWords) {
    const sensitiveWords = [
      "测试",
      "test",
      "垃圾",
      "spam",
      "广告",
      "推广",
      "色情",
      "暴力",
      "政治",
      "敏感",
      "吸毒"
    ];

    const lowerInput = trimmed.toLowerCase();
    for (const word of sensitiveWords) {
      if (lowerInput.includes(word.toLowerCase())) {
        // 对于某些明显是测试的词，给出更友好的提示
        if (word === "测试" || word === "test") {
          return { valid: false, error: "请输入一个真实的「第一次」体验，比如：健身、旅行、做饭等" };
        }
        return { valid: false, error: "输入内容包含不当词汇" };
      }
    }
  }

  // 5. 内容类型检查（确保是中文活动相关的内容）
  // 检查是否包含至少一个中文字符
  const hasChinese = /[\u4e00-\u9fa5]/.test(trimmed);
  if (!hasChinese && trimmed.length < 8) {
    // 如果很短且没有中文，可能是无意义的输入
    return { valid: false, error: "请输入一个活动或体验，比如：健身、旅行、做饭" };
  }

  // 6. 重复字符检查（防止类似 "aaaaaaaa" 这样的输入）
  const repeatedCharPattern = /(.)\1{4,}/; // 同一个字符重复5次以上
  if (repeatedCharPattern.test(trimmed)) {
    return { valid: false, error: "输入内容过于简单，请描述一个具体的活动或体验" };
  }

  // 7. 纯数字检查
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, error: "请输入一个活动或体验，而不是纯数字" };
  }

  return { valid: true };
}

/**
 * 清理输入文本（移除危险字符，保留安全内容）
 * @param inputText 原始输入
 * @returns 清理后的文本
 */
export function sanitizeInput(inputText: string): string {
  return inputText
    .trim()
    .replace(/[<>]/g, "") // 移除HTML标签字符
    .replace(/javascript:/gi, "") // 移除javascript协议
    .replace(/on\w+\s*=/gi, "") // 移除事件处理器
    .slice(0, 50); // 限制最大长度
}

/**
 * 检查输入是否与最近的历史记录重复
 * @param inputText 用户输入
 * @param recentInputs 最近的历史输入列表
 * @param timeWindowMinutes 时间窗口（分钟），默认5分钟
 * @returns 是否重复
 */
export function isDuplicateInput(
  inputText: string,
  recentInputs: string[],
  timeWindowMinutes: number = 5
): boolean {
  const normalized = inputText.trim().toLowerCase();
  return recentInputs.some((recent) => recent.trim().toLowerCase() === normalized);
}

