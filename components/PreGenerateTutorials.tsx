"use client";

import { useEffect } from "react";

/**
 * 预生成教程组件
 * 仅在首次加载时检查并触发预生成（如果还没有预生成数据）
 * 使用 localStorage 标记，避免每次加载都调用API
 * 
 * 注意：推荐使用初始化脚本一次性生成所有预生成教程
 * 脚本位置：scripts/init-pre-generated-tutorials.ts
 */
export default function PreGenerateTutorials() {
  useEffect(() => {
    // 检查是否已经初始化过（使用 localStorage 标记）
    const initKey = "pre_generated_tutorials_init";
    const hasInitialized = localStorage.getItem(initKey);

    // 如果已经初始化过，直接返回
    if (hasInitialized) {
      return;
    }

    // 定义首页显示的活动列表
    const activities = [
      "健身",
      "做饭", "旅行",
      "蹦极", "购物", "开车",
      "画画", "唱歌", "读书", "拼豆"
    ];

    // 延迟触发，不阻塞页面加载
    const timer = setTimeout(() => {
      // 批量预生成所有活动（API会检查是否已存在，不会重复生成）
      fetch("/api/tutorials/pre-generate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activities }),
      })
        .then((response) => {
          if (response.ok) {
            // 标记为已初始化（即使部分失败也算初始化过）
            localStorage.setItem(initKey, "true");
          }
        })
        .catch((error) => {
          // 静默处理错误，不显示给用户
          console.debug("预生成教程失败:", error);
        });
    }, 2000); // 延迟2秒执行，确保页面完全加载

    return () => clearTimeout(timer);
  }, []);

  // 这个组件不渲染任何内容
  return null;
}

