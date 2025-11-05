import { buildTutorialPrompt, parseAIOutput, callAI } from "@/lib/ai";
import OpenAI from "openai";

// Mock OpenAI
jest.mock("openai");

describe("lib/ai", () => {
  // 设置测试环境变量
  const originalEnv = process.env;

  beforeAll(() => {
    process.env.SILICONFLOW_API_KEY = "test-api-key";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

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
    it("应该调用 OpenAI API 并返回解析后的 JSON", async () => {
      const mockResponse = {
        title: "测试教程",
        description: "测试描述",
        items: ["物品1", "物品2"],
        steps: [
          { title: "步骤1", summary: "摘要1" },
          { title: "步骤2", summary: "摘要2" },
          { title: "步骤3", summary: "摘要3" },
          { title: "步骤4", summary: "摘要4" },
          { title: "步骤5", summary: "摘要5" },
          { title: "步骤6", summary: "摘要6" },
        ],
        tags: ["标签1", "标签2", "标签3"],
        difficulty: 3,
      };

      const mockCreate = jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResponse),
            },
          },
        ],
      });

      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as unknown as OpenAI));

      const result = await callAI("测试 prompt");

      expect(mockCreate).toHaveBeenCalledWith({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: "测试 prompt",
          },
        ],
        temperature: 0.7,
      });

      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("steps");
      expect(result).toHaveProperty("items");
    });

    it("应该在没有 API key 时抛出错误", async () => {
      const originalApiKey = process.env.SILICONFLOW_API_KEY;
      delete process.env.SILICONFLOW_API_KEY;

      await expect(callAI("测试 prompt")).rejects.toThrow("SILICONFLOW_API_KEY 环境变量未设置");

      process.env.SILICONFLOW_API_KEY = originalApiKey;
    });
  });
});

