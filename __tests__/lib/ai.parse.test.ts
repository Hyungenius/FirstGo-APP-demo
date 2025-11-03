import { parseAIOutput } from "@/lib/ai";

describe("parseAIOutput edge cases", () => {
  it("应该处理空数组", () => {
    const result = parseAIOutput({ title: "测试", items: [], steps: [] });
    expect(result.title).toBe("测试");
    expect(result.items).toHaveLength(0);
    expect(result.steps.length).toBeGreaterThanOrEqual(6); // 应该补齐
  });

  it("应该过滤无效的 items", () => {
    const result = parseAIOutput({
      title: "测试",
      items: [{ name: "有效" }, { name: "" }, null, undefined],
      steps: [{ title: "步骤", summary: "摘要" }],
    });
    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toBe("有效");
  });
});

