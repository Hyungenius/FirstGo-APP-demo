/**
 * 活动名称标准化工具
 * 将相似的活动名称映射到标准名称，用于勋章合并
 */

/**
 * 标准化活动名称
 * 将相似的活动名称（如"第一次去健身房"、"去健身房"）映射到标准名称（如"健身"）
 */
export function normalizeActivityName(inputText: string): string {
  if (!inputText || typeof inputText !== "string") {
    return "完成教程";
  }

  const trimmed = inputText.trim();
  if (!trimmed) {
    return "完成教程";
  }

  const lowerText = trimmed.toLowerCase();

  // 健身相关
  if (
    lowerText.includes("健身") ||
    lowerText.includes("健身房") ||
    lowerText.includes("运动") ||
    lowerText.includes("锻炼") ||
    lowerText.includes("训练")
  ) {
    return "健身";
  }

  // 做饭/烹饪相关
  if (
    lowerText.includes("做饭") ||
    lowerText.includes("烹饪") ||
    lowerText.includes("做菜") ||
    lowerText.includes("料理") ||
    lowerText.includes("下厨")
  ) {
    return "做饭";
  }

  // 旅行相关
  if (
    lowerText.includes("旅行") ||
    lowerText.includes("旅游") ||
    lowerText.includes("出行") ||
    lowerText.includes("出游")
  ) {
    return "旅行";
  }

  // 画画/绘画相关
  if (
    lowerText.includes("画画") ||
    lowerText.includes("绘画") ||
    lowerText.includes("画图") ||
    lowerText.includes("涂鸦")
  ) {
    return "画画";
  }

  // 唱歌相关
  if (
    lowerText.includes("唱歌") ||
    lowerText.includes("学唱歌") ||
    lowerText.includes("唱歌课") ||
    lowerText.includes("声乐") ||
    lowerText.includes("K歌")
  ) {
    return "唱歌";
  }

  // 读书/阅读相关
  if (
    lowerText.includes("读书") ||
    lowerText.includes("阅读") ||
    lowerText.includes("看书") ||
    lowerText.includes("学习")
  ) {
    return "读书";
  }

  // 开车/驾驶相关
  if (
    lowerText.includes("开车") ||
    lowerText.includes("驾驶") ||
    lowerText.includes("学车") ||
    lowerText.includes("考驾照")
  ) {
    return "开车";
  }

  // 游泳相关
  if (
    lowerText.includes("游泳") ||
    lowerText.includes("学游泳") ||
    lowerText.includes("游泳课") ||
    lowerText.includes("游泳训练")
  ) {
    return "游泳";
  }

  // 购物相关
  if (
    lowerText.includes("购物") ||
    lowerText.includes("买东西") ||
    lowerText.includes("采购") ||
    lowerText.includes("逛街")
  ) {
    return "购物";
  }

  // 蹦极相关
  if (lowerText.includes("蹦极") || lowerText.includes("bungee")) {
    return "蹦极";
  }

  // 拼豆相关
  if (lowerText.includes("拼豆") || lowerText.includes("豆豆")) {
    return "拼豆";
  }

  // 潜水相关
  if (lowerText.includes("潜水") || lowerText.includes("diving")) {
    return "潜水";
  }

  // 滑板相关
  if (lowerText.includes("滑板") || lowerText.includes("skateboard")) {
    return "滑板";
  }

  // 街舞相关
  if (lowerText.includes("街舞") || lowerText.includes("dance")) {
    return "街舞";
  }

  // 跳伞相关
  if (lowerText.includes("跳伞") || lowerText.includes("skydiving")) {
    return "跳伞";
  }

  // 泡温泉相关
  if (lowerText.includes("泡温泉") || lowerText.includes("温泉")) {
    return "泡温泉";
  }

  // 约会相关
  if (lowerText.includes("约会") || lowerText.includes("date")) {
    return "约会";
  }

  // 针织相关
  if (lowerText.includes("针织") || lowerText.includes("编织") || lowerText.includes("织毛衣")) {
    return "针织";
  }

  // 冲浪相关
  if (lowerText.includes("冲浪") || lowerText.includes("surfing")) {
    return "冲浪";
  }

  // 爬山相关
  if (lowerText.includes("爬山") || lowerText.includes("登山") || lowerText.includes("徒步")) {
    return "爬山";
  }

  // 实习相关
  if (lowerText.includes("实习") || lowerText.includes("internship")) {
    return "实习";
  }

  // 如果没有匹配到任何标准活动，返回原始输入（去除"第一次"等前缀）
  // 例如："第一次去健身房" -> "健身"，但如果是全新的活动，保留原样
  const cleaned = trimmed
    .replace(/^第一次(去|做|学|体验|尝试)?/i, "")
    .replace(/^去(做|学|体验|尝试)?/i, "")
    .replace(/^做(一次)?/i, "")
    .replace(/^学(习|会)?/i, "")
    .trim();

  // 如果清理后还有内容，返回清理后的内容；否则返回原始输入
  return cleaned || trimmed;
}

/**
 * 生成标准化的 badge key
 * 使用标准化后的活动名称作为 key，而不是教程ID
 */
export function generateBadgeKey(normalizedActivityName: string): string {
  // 使用标准化后的活动名称作为 key
  // 这样可以确保相同的活动使用相同的 badge key
  return `activity_${normalizedActivityName}`;
}

