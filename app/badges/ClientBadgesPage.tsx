"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Badge {
  id: string;
  awarded_at: string;
  source_tutorial?: string | null;
  badges: {
    id: string;
    key: string;
    title: string;
    description?: string | null;
    icon_url?: string | null;
  };
  tutorial_instances?: {
    id: string;
    input_text?: string | null;
  } | null;
}

// 根据用户输入文字选择合适的emoji
function getEmojiForTutorial(inputText: string | null | undefined): string {
  if (!inputText) return "🏅";
  
  const lowerText = inputText.toLowerCase();
  
  // 健身相关
  if (lowerText.includes("健身") || lowerText.includes("运动") || lowerText.includes("锻炼") || lowerText.includes("跑步")) {
    return "💪";
  }
  // 烹饪相关
  if (lowerText.includes("做饭") || lowerText.includes("烹饪") || lowerText.includes("做菜") || lowerText.includes("料理")) {
    return "👨‍🍳";
  }
  // 学习相关
  if (lowerText.includes("学习") || lowerText.includes("读书") || lowerText.includes("考试")) {
    return "📚";
  }
  // 旅行相关
  if (lowerText.includes("旅行") || lowerText.includes("旅游") || lowerText.includes("出行")) {
    return "✈️";
  }
  // 工作相关
  if (lowerText.includes("工作") || lowerText.includes("面试") || lowerText.includes("上班")) {
    return "💼";
  }
  // 购物相关
  if (lowerText.includes("购物") || lowerText.includes("买东西") || lowerText.includes("采购")) {
    return "🛒";
  }
  // 音乐相关
  if (lowerText.includes("音乐") || lowerText.includes("唱歌") || lowerText.includes("演奏")) {
    return "🎵";
  }
  // 艺术相关
  if (lowerText.includes("绘画") || lowerText.includes("画画") || lowerText.includes("艺术")) {
    return "🎨";
  }
  // 游戏相关
  if (lowerText.includes("游戏") || lowerText.includes("打游戏")) {
    return "🎮";
  }
  // 开车相关
  if (lowerText.includes("开车") || lowerText.includes("驾驶") || lowerText.includes("学车")) {
    return "🚗";
  }
  
  // 默认返回奖杯
  return "🏅";
}

export default function ClientBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/badges", { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `加载失败（${res.status}）`);
        if (cancelled) return;
        setBadges(data?.badges || []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <div className="p-6 pixel-font" style={{ backgroundColor: '#f5f0e8', color: '#6b5335' }}>加载中...</div>;
  }
  if (error) {
    return <div className="p-6 pixel-font" style={{ backgroundColor: '#f5f0e8', color: '#8b0000' }}>{error}</div>;
  }

  // 按获取时间排序，计算每个勋章的序号
  const sortedBadges = [...badges].sort((a, b) => {
    const dateA = new Date(a.awarded_at).getTime();
    const dateB = new Date(b.awarded_at).getTime();
    return dateA - dateB;
  });

  return (
    <div className="mx-auto w-full max-w-4xl p-6 pixel-font" style={{ minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="pixel-font text-2xl font-medium" style={{ color: '#6b5335' }}>勋章墙</h1>
        <Link
          href="/"
          className="pixel-wooden-button px-3 py-2 text-sm"
        >
          返回首页
        </Link>
      </div>
      {badges.length === 0 ? (
        <div className="pixel-wooden-container p-8 text-center">
          <p className="pixel-font" style={{ color: '#6b5335' }}>还没有获得勋章，完成教程后可以获得勋章！</p>
          <Link
            href="/"
            className="mt-4 inline-block pixel-wooden-button px-4 py-2"
          >
            开始创建
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedBadges.map((item, index) => {
            const inputText = item.tutorial_instances?.input_text || "完成教程";
            const emoji = getEmojiForTutorial(inputText);
            const isPlaying = playingVideoId === item.id;
            const tutorialNumber = index + 1; // 第几个教程（从1开始）
            
            return (
              <div
                key={item.id}
                className="relative pixel-wooden-card p-4 text-center cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  if (isPlaying) {
                    setPlayingVideoId(null);
                  } else {
                    setPlayingVideoId(item.id);
                  }
                }}
              >
                {isPlaying ? (
                  <div className="mb-2 w-full">
                    <video
                      src="/assets/xunzhang.mov"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="w-full h-auto rounded-lg"
                      style={{
                        objectFit: 'contain',
                        imageRendering: 'pixelated'
                      }}
                    >
                      您的浏览器不支持视频播放。
                    </video>
                  </div>
                ) : (
                  <div className="mb-2 text-4xl">{emoji}</div>
                )}
                <h3 className="pixel-font mb-1 text-lg font-medium" style={{ color: '#6b5335' }}>
                  {inputText}
                </h3>
                <p className="pixel-font mb-2 text-sm" style={{ color: '#6b5335' }}>
                  完成了第{tutorialNumber}个教程
                </p>
                <div className="pixel-font text-xs" style={{ color: '#8b6f47' }}>
                  获得于 {formatDate(item.awarded_at)}
                </div>
                {!isPlaying && (
                  <div className="pixel-font mt-2 text-xs" style={{ color: '#8b6f47' }}>
                    点击播放动画
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

