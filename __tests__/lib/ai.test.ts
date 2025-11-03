import { buildTutorialPrompt, parseAIOutput, callAI } from "@/lib/ai";

describe("lib/ai", () => {
  describe("buildTutorialPrompt", () => {
    it("应该生成包含用户输入的 prompt", () => {
      const prompt = buildTutorialPrompt("第一次去健身房");
      expect(prompt).toContain("第一次去健身房");
      expect(prompt).toContain("JSON");
      expect(prompt).toContain("steps length should be 6-7");
    });

    it("应该处理空字符串", () => {
      const prompt = buildTutorialPrompt("");
      expect(prompt).toBeTruthy();
    });
  });

  describe("parseAIOutput", () => {
    it("应该正确解析有效的 AI 输出", () => {
      const mockOutput = {
        title: "测试教程",
        description: "测试描述",
        items: [{ name: "物品1" }, { name: "物品2", qty: "1" }],
        steps: [
          { title: "步骤1", summary: "摘要1" },
          { title: "步骤2", summary: "摘要2" },
        ],
        tags: ["标签1"],
        difficulty: "easy",
      };

      const result = parseAIOutput(mockOutput);
      expect(result.title).toBe("测试教程");
      expect(result.items).toHaveLength(2);
      expect(result.steps.length).toBeGreaterThanOrEqual(6); // 应该补齐到至少 6 步
    });

    it("应该处理无效输入", () => {
      expect(() => parseAIOutput(null)).toThrow("AI 输出无效");
      expect(() => parseAIOutput("invalid")).toThrow("AI 输出无效");
    });

    it("应该处理缺少步骤的情况并补齐", () => {
      const mockOutput = {
        title: "测试",
        items: [],
        steps: [{ title: "步骤1", summary: "摘要1" }],
      };

      const result = parseAIOutput(mockOutput);
      expect(result.steps.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("callAI", () => {
    it("应该返回固定结构（mock）", async () => {
      const result = await callAI("测试 prompt");
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("steps");
      expect(result).toHaveProperty("items");
      expect(result.steps.length).toBeGreaterThanOrEqual(6);
    });
  });
});

