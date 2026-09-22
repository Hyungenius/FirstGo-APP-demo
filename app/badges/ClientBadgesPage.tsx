"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { normalizeActivityName } from "@/lib/badgeUtils";

// 视频播放组件，优化移动端播放
function VideoPlayer({ src, onError }: { src: string; onError?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 设置视频属性，确保移动端兼容
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true'); // 腾讯 X5 内核
    video.setAttribute('x5-video-player-type', 'h5');
    video.setAttribute('x5-video-player-fullscreen', 'false');

    // 尝试播放视频
    const attemptPlay = () => {
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setShowPlayButton(false);
          })
          .catch((error) => {
            console.log("视频自动播放失败:", error);
            // 在移动端，自动播放可能失败，显示播放按钮
            setShowPlayButton(true);
          });
      }
    };

    // 监听多个事件，确保视频能播放
    const handleCanPlay = () => attemptPlay();
    const handleLoadedData = () => attemptPlay();
    const handleLoadedMetadata = () => attemptPlay();

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // 如果视频已经可以播放，立即尝试播放
    if (video.readyState >= 2) {
      attemptPlay();
    }
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [src]);

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play()
        .then(() => {
          setShowPlayButton(false);
        })
        .catch((error) => {
          console.error("手动播放失败:", error);
        });
    }
  };

  // 根据文件扩展名确定 MIME 类型
  const getVideoType = (src: string): string => {
    if (src.endsWith('.mov')) {
      return 'video/quicktime';
    } else if (src.endsWith('.mp4')) {
      return 'video/mp4';
    }
    return 'video/mp4'; // 默认
  };

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-auto rounded-lg"
        style={{
          objectFit: 'contain',
          imageRendering: 'pixelated',
        }}
        onError={(e) => {
          console.error("视频加载错误:", e);
          const video = e.currentTarget;
          console.error("视频错误详情:", {
            error: video.error?.code,
            message: video.error?.message,
            networkState: video.networkState,
            readyState: video.readyState,
            src: video.src
          });
          onError?.();
        }}
      >
        <source src={src} type={getVideoType(src)} onError={() => onError?.()} />
        您的浏览器不支持视频播放。
      </video>
      {showPlayButton && (
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg cursor-pointer transition-opacity hover:bg-opacity-40"
        >
          <div className="pixel-font text-white text-3xl">▶️</div>
        </button>
      )}
    </div>
  );
}

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
  if (lowerText.includes("音乐") || lowerText.includes("演奏")) {
    return "🎵";
  }
  // 唱歌相关
  if (lowerText.includes("唱歌") || lowerText.includes("学唱歌") || lowerText.includes("唱歌课") || lowerText.includes("声乐")) {
    return "🎤";
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

// 判断是否是游泳相关的教程
function isSwimmingRelated(inputText: string | null | undefined): boolean {
  if (!inputText) return false;
  
  const lowerText = inputText.toLowerCase();
  return lowerText.includes("游泳") || 
         lowerText.includes("学游泳") || 
         lowerText.includes("游泳课") ||
         lowerText.includes("游泳训练");
}

// 判断是否是唱歌相关的教程
function isSingingRelated(inputText: string | null | undefined): boolean {
  if (!inputText) return false;
  
  const lowerText = inputText.toLowerCase();
  return lowerText.includes("唱歌") || 
         lowerText.includes("学唱歌") || 
         lowerText.includes("唱歌课") ||
         lowerText.includes("声乐");
}

// 判断是否是画画相关的教程
function isPaintingRelated(inputText: string | null | undefined): boolean {
  if (!inputText) return false;
  
  const lowerText = inputText.toLowerCase();
  return lowerText.includes("绘画") || 
         lowerText.includes("画画") || 
         lowerText.includes("艺术");
}

// 根据教程标题获取对应的动画视频路径
function getAnimationVideo(inputText: string | null | undefined): string {
  if (isSwimmingRelated(inputText)) {
    return "/assets/swim.mp4";
  }
  if (isSingingRelated(inputText)) {
    return "/assets/sing.mp4";
  }
  if (isPaintingRelated(inputText)) {
    return "/assets/paint.mp4";
  }
  return "/assets/xunzhang.mp4";
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

  // 按标准化后的活动名称合并相同的教程，统计完成次数
  interface MergedBadge {
    normalizedName: string; // 标准化后的活动名称（用于显示）
    originalInputTexts: string[]; // 原始输入文本列表（用于显示所有变体）
    count: number;
    firstAwardedAt: string; // 第一次完成的时间
    badgeIds: string[]; // 用于视频播放的唯一标识
    representativeBadge: Badge; // 代表勋章（用于获取emoji等）
  }

  const mergedBadgesMap = new Map<string, MergedBadge>();

  badges.forEach((item) => {
    const inputText = item.tutorial_instances?.input_text || "完成教程";
    // 使用标准化后的活动名称作为合并键
    const normalizedName = normalizeActivityName(inputText);
    
    if (mergedBadgesMap.has(normalizedName)) {
      const existing = mergedBadgesMap.get(normalizedName)!;
      existing.count += 1;
      existing.badgeIds.push(item.id);
      // 如果这个时间更早，更新第一次完成时间
      const currentTime = new Date(item.awarded_at).getTime();
      const firstTime = new Date(existing.firstAwardedAt).getTime();
      if (currentTime < firstTime) {
        existing.firstAwardedAt = item.awarded_at;
      }
      // 添加原始输入文本（如果不同）
      if (!existing.originalInputTexts.includes(inputText)) {
        existing.originalInputTexts.push(inputText);
      }
    } else {
      mergedBadgesMap.set(normalizedName, {
        normalizedName,
        originalInputTexts: [inputText],
        count: 1,
        firstAwardedAt: item.awarded_at,
        badgeIds: [item.id],
        representativeBadge: item,
      });
    }
  });

  // 转换为数组并按第一次完成时间排序
  const mergedBadges = Array.from(mergedBadgesMap.values()).sort((a, b) => {
    const dateA = new Date(a.firstAwardedAt).getTime();
    const dateB = new Date(b.firstAwardedAt).getTime();
    return dateA - dateB;
  });

  return (
    <div className="mx-auto w-full max-w-4xl p-6 pixel-font" style={{ minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="pixel-font text-2xl font-medium" style={{ color: '#6b5335' }}>勋章墙</h1>
        <Link
          href="/"
          className="inline-flex items-center gap-2 pixel-wooden-button px-3 py-2 text-sm"
        >
          <img 
            src="/assets/return.png" 
            alt="返回" 
            className="pixel-image"
            style={{ 
              width: 'auto',
              height: 'auto',
              maxWidth: '20px',
              maxHeight: '20px',
              objectFit: 'contain',
              imageRendering: 'pixelated'
            }}
          />
          返回首页
        </Link>
      </div>
      {mergedBadges.length === 0 ? (
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
          {mergedBadges.map((merged, index) => {
            // 使用标准化后的活动名称作为显示名称
            const displayName = merged.normalizedName;
            const emoji = getEmojiForTutorial(displayName);
            // 使用标准化名称和第一个 badgeId 作为播放标识
            const videoKey = `${displayName}-${merged.badgeIds[0]}`;
            const isPlaying = playingVideoId === videoKey;
            
            return (
              <div
                key={displayName}
                className="relative pixel-wooden-card p-4 text-center cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  if (isPlaying) {
                    setPlayingVideoId(null);
                  } else {
                    setPlayingVideoId(videoKey);
                  }
                }}
              >
                {isPlaying ? (
                  <div className="mb-2 w-full">
                    <VideoPlayer 
                      src={getAnimationVideo(displayName)}
                      onError={() => {
                        // 视频加载失败时，隐藏视频显示 emoji
                        setPlayingVideoId(null);
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-2 text-4xl">{emoji}</div>
                )}
                <h3 className="pixel-font mb-1 text-lg font-medium" style={{ color: '#6b5335' }}>
                  {displayName}
                </h3>
                <p className="pixel-font mb-2 text-sm" style={{ color: '#6b5335' }}>
                  已完成 {merged.count} 次
                </p>
                <div className="pixel-font text-xs" style={{ color: '#8b6f47' }}>
                  首次完成于 {formatDate(merged.firstAwardedAt)}
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
