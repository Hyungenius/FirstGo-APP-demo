"use client";

import Link from "next/link";
import DebugSupabase from "@/components/DebugSupabase";
import HomeCreateStarter from "@/components/HomeCreateStarter";
import AuthGuard from "@/components/AuthGuard";
import PreGenerateTutorials from "@/components/PreGenerateTutorials";
import { useState, useRef } from "react";
import InputFirstThing, { InputFirstThingRef } from "@/components/InputFirstThing";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [initialValue, setInitialValue] = useState<string>("");
  const inputRef = useRef<InputFirstThingRef | null>(null);
  
  // 所有21个活动
  const allActivities = [
    "健身", "做饭", "旅行", "蹦极", "购物", 
    "开车", "画画", "唱歌", "读书", "拼豆",
    "潜水", "滑板", "街舞", "跳伞", "泡温泉",
    "约会", "针织", "冲浪", "爬山", "实习", "游泳"
  ];
  
  // 随机选择10个活动的函数（Fisher-Yates 洗牌算法）
  const getRandomActivities = (): string[] => {
    const shuffled = [...allActivities];
    // Fisher-Yates 洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 10);
  };
  
  // 状态：当前显示的10个活动
  const [displayedActivities, setDisplayedActivities] = useState<string[]>(() => getRandomActivities());
  
  // 点击骰子按钮，重新随机生成10个活动
  const handleDiceClick = () => {
    setDisplayedActivities(getRandomActivities());
  };
  
  const handleQuickStart = (text: string) => {
    setInitialValue(text);
    setTimeout(() => {
      inputRef.current?.setValueAndSubmit(text);
    }, 100);
  };
  
  // 将10个活动按照原来的布局方式分组（1、2、3、4块）
  // 确保有足够的活动，如果不足则用空字符串填充
  const safeActivities = [...displayedActivities];
  while (safeActivities.length < 10) {
    safeActivities.push("");
  }
  
  const blocks = [
    { count: 1, activities: [safeActivities[0]].filter(a => a) },
    { count: 2, activities: [safeActivities[1], safeActivities[2]].filter(a => a) },
    { count: 3, activities: [safeActivities[3], safeActivities[4], safeActivities[5]].filter(a => a) },
    { count: 4, activities: [safeActivities[6], safeActivities[7], safeActivities[8], safeActivities[9]].filter(a => a) },
  ];
  
  return (
    <AuthGuard>
      <PreGenerateTutorials />
      <div className="relative flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f5f0e8' }}>
        {/* 状态栏 - 显示图标 */}
        <div className="absolute top-0 right-0 flex items-center gap-4 px-4 py-2 z-20">
          <button
            onClick={handleDiceClick}
            className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
            title="随机生成活动"
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
            }}
          >
            <div
              className="pixel-font text-4xl"
              style={{
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
              }}
            >
              🎲
            </div>
          </button>
          <Link href="/badges" className="cursor-pointer transition-opacity hover:opacity-70">
            <img 
              src="/assets/prize.PNG" 
              alt="勋章墙" 
              className="pixel-image"
              style={{ 
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                imageRendering: 'pixelated'
              }}
            />
          </Link>
          <Link href="/history" className="cursor-pointer transition-opacity hover:opacity-70">
            <img 
              src="/assets/clock.PNG" 
              alt="历史记录" 
              className="pixel-image"
              style={{ 
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                imageRendering: 'pixelated'
              }}
            />
          </Link>
        </div>

        {/* 主要内容区域 */}
        <main className="relative flex w-full max-w-5xl flex-col gap-8 py-20 px-4 sm:px-6 md:px-10" style={{ overflowX: 'hidden' }}>
          {/* 上部分：对话气泡和木块堆（横向布局） */}
          <div className="flex flex-row items-start justify-center gap-4 w-full -mt-8">
            {/* 左侧：对话气泡（带尾巴的圆角矩形，包含牛仔角色） */}
            <div className="relative">
              <div 
                className="pixel-font rounded-lg px-6 py-4 text-sm relative flex items-center gap-3"
                style={{ 
                  backgroundColor: '#ffffff',
                  border: '3px solid #8b6f47',
                  borderRadius: '12px',
                  color: '#4a4a4a',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {/* 牛仔角色 */}
                <img 
                  src="/assets/cowboy.PNG" 
                  alt="牛仔角色" 
                  className="pixel-image flex-shrink-0"
                  style={{ 
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '80px',
                    maxHeight: '80px',
                    objectFit: 'contain',
                    imageRendering: 'pixelated'
                  }}
                />
                {/* 对话文本 */}
                <div className="flex flex-col">
                  <div>嘿! 没想好做什么?</div>
                  <div>不如试试......</div>
                </div>
              </div>
              {/* 气泡尾巴 */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '20px',
                  width: '0',
                  height: '0',
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '8px solid #8b6f47',
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '21px',
                  width: '0',
                  height: '0',
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: '7px solid #ffffff',
                }}
              />
            </div>

            {/* 右侧：木块堆叠区域（倒转：1、2、3、4块，居中排列） */}
            <div className="flex flex-col items-center gap-1">
              {blocks.map((block, blockIndex) => {
                if (block.activities.length === 0) return null;
                return (
                  <div key={blockIndex} className="flex gap-1">
                    {block.activities.map((activity, activityIndex) => (
                      <div
                        key={`${blockIndex}-${activityIndex}-${activity}`}
                        onClick={() => handleQuickStart(activity)}
                        className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        style={{ position: 'relative' }}
                      >
                        <img
                          src="/assets/wood.PNG"
                          alt={activity}
                          className="pixel-image"
                          style={{
                            width: '64px',
                            height: 'auto',
                            objectFit: 'contain',
                            imageRendering: 'pixelated'
                          }}
                        />
                        <div
                          className="absolute inset-0 flex items-center justify-center pixel-font text-xs font-medium pointer-events-none"
                          style={{
                            color: '#6b5335',
                            textShadow: '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8)'
                          }}
                        >
                          {activity}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 下部分：输入区域 */}
          <div className="relative w-full sm:w-2/3 mx-auto flex flex-col px-4 sm:px-0">
            {/* 输入框（使用原来的 CSS 样式） */}
            <div 
              className="pixel-font rounded-lg p-4 sm:p-6"
              style={{ 
                backgroundColor: '#faf5ed',
                border: '4px solid #8b6f47',
                borderRadius: '12px',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              <InputFirstThing
                ref={inputRef}
                initialValue={initialValue}
                onCreated={(id) => {
                  setInitialValue(""); // 重置初始值
                  router.push(`/tutorial/${id}`);
                }}
                onError={() => {}}
              />
            </div>
          </div>
        </main>
        <DebugSupabase />
      </div>
    </AuthGuard>
  );
}
