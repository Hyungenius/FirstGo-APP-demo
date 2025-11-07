"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TutorialProgress from "@/components/TutorialProgress";
import SwipeableStep from "@/components/SwipeableStep";
import ModalDetail from "@/components/ModalDetail";
import StepDetailContent from "@/components/StepDetailContent";
import TutorialSkeleton from "@/components/TutorialSkeleton";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface Step {
  id: string;
  ord: number;
  title: string;
  summary?: string | null;
  completed?: boolean;
}

interface Item {
  id: string;
  name: string;
  qty?: string | null;
  note?: string | null;
}

export default function ClientTutorialPage({ tutorialId }: { tutorialId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openStepId, setOpenStepId] = useState<string | null>(null);
  const pendingSetRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const longPressStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tutorials/${tutorialId}`, { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `加载失败（${res.status}）`);
        if (cancelled) return;
        setTitle(data?.tutorial?.title || "");
        const ss: Step[] = (data?.steps || []).map((s: {
          id: string;
          ord: number;
          title: string;
          summary: string | null;
          completed: boolean;
        }) => ({
          id: s.id,
          ord: s.ord,
          title: s.title,
          summary: s.summary,
          completed: !!s.completed,
        }));
        setSteps(ss);
        const itemsData: Item[] = (data?.items || []).map((i: {
          id: string;
          name: string;
          qty: string | null;
          note: string | null;
        }) => ({
          id: i.id,
          name: i.name,
          qty: i.qty,
          note: i.note,
        }));
        setItems(itemsData);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tutorialId]);

  // Realtime 订阅：监听 steps 更新
  useEffect(() => {
    if (!tutorialId || steps.length === 0) return;
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`steps:${tutorialId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "steps",
          filter: `tutorial_id=eq.${tutorialId}`,
        },
        (payload) => {
          const updatedStep = payload.new as {
            id: string;
            completed: boolean;
          };
          setSteps((prev) =>
            prev.map((s) =>
              s.id === updatedStep.id
                ? {
                    ...s,
                    completed: !!updatedStep.completed,
                  }
                : s
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tutorialId, steps.length]);

  const completed = steps.filter((s) => s.completed).length;
  const allDone = steps.length > 0 && completed === steps.length;

  const [preparationExpanded, setPreparationExpanded] = useState(true);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  // 找到第一个未完成的步骤作为活动步骤
  useEffect(() => {
    const firstIncomplete = steps.find(s => !s.completed);
    setActiveStepId(firstIncomplete?.id || steps[steps.length - 1]?.id || null);
  }, [steps]);

  // 清理长按定时器
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (longPressProgressIntervalRef.current) {
        clearInterval(longPressProgressIntervalRef.current);
      }
    };
  }, []);

  function isPending(stepId: string) {
    return pendingSetRef.current.has(stepId);
  }

  function undoStep(stepId: string) {
    const timers = timersRef.current;
    if (timers[stepId]) {
      clearTimeout(timers[stepId]);
      delete timers[stepId];
    }
    pendingSetRef.current.delete(stepId);
    setSteps((prev) => prev.map((p) => (p.id === stepId ? { ...p, completed: false } : p)));
  }

  if (loading) {
    return <TutorialSkeleton />;
  }
  if (error) {
    return <div className="p-6 pixel-font" style={{ backgroundColor: '#f5f0e8', color: '#8b0000' }}>{error}</div>;
  }

  return (
    <div className="relative mx-auto w-full max-w-3xl p-6 pixel-font" style={{ minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 pixel-wooden-button text-sm"
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

        {/* 标题 */}
        <div className="mb-6 pixel-wooden-container p-4 text-center">
          <h1 className="pixel-font text-xl font-medium" style={{ color: '#6b5335' }}>
            {title || "教程"}
          </h1>
        </div>

        {/* 进度条 */}
        {steps.length > 0 && (
          <div className="mb-6">
            <TutorialProgress total={steps.length} completed={completed} />
          </div>
        )}

        {/* 准备部分 */}
        {items.length > 0 && (
          <div className="mb-6 pixel-wooden-card p-4">
            <div className="flex">
              <div className="w-20 flex items-center justify-center">
                <img 
                  src="/assets/bag.PNG" 
                  alt="背包" 
                  className="pixel-image"
                  style={{ 
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '64px',
                    maxHeight: '64px',
                    objectFit: 'contain',
                    imageRendering: 'pixelated'
                  }}
                />
              </div>
              <div className="flex-1 pl-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="pixel-font text-base font-medium flex items-center gap-2" style={{ color: '#6b5335' }}>
                    <img 
                      src="/assets/bag.PNG" 
                      alt="背包" 
                      className="pixel-image"
                      style={{ 
                        width: '20px',
                        height: '20px',
                        objectFit: 'contain',
                        imageRendering: 'pixelated'
                      }}
                    />
                    准备物品
                  </h2>
                  <button
                    onClick={() => setPreparationExpanded(!preparationExpanded)}
                    className="pixel-wooden-button px-2 py-1 text-xs"
                  >
                    {preparationExpanded ? "收缩" : "展开"}
                  </button>
                </div>
                {preparationExpanded && (
                  <div className="space-y-1 text-sm text-black">
                    {items.map((item, idx) => (
                      <div key={item.id}>
                        {idx + 1}. {item.name}
                        {item.qty && ` (${item.qty})`}
                        {item.note && ` - ${item.note}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 步骤列表 */}
        <div className="mb-6 space-y-3">
          {steps.map((s) => (
            <div key={s.id} className="space-y-2">
              <div
                className={activeStepId === s.id ? 'border-gray-400' : ''}
                style={{ border: activeStepId === s.id ? '1px solid #9ca3af' : 'none', borderRadius: '4px', padding: '2px' }}
              >
                <SwipeableStep
                  ord={s.ord}
                  title={s.title}
                  summary={s.summary || undefined}
                  completed={s.completed}
                  onDetailClick={() => {
                    setOpenStepId(s.id);
                    setActiveStepId(s.id);
                  }}
                  onComplete={() => {
                    if (s.completed) return;
                    // 乐观完成并提供 2s 撤销窗口
                    setSteps((prev) => prev.map((p) => (p.id === s.id ? { ...p, completed: true } : p)));
                    pendingSetRef.current.add(s.id);

                    timersRef.current[s.id] = setTimeout(async () => {
                      try {
                        const res = await fetch(`/api/tutorials/${tutorialId}/steps/${s.id}/complete`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ completed: true }),
                        });
                        if (!res.ok) throw new Error("更新失败");
                      } catch {
                        // 回滚
                        setSteps((prev) => prev.map((p) => (p.id === s.id ? { ...p, completed: false } : p)));
                      } finally {
                        pendingSetRef.current.delete(s.id);
                        delete timersRef.current[s.id];
                      }
                    }, 2000);
                  }}
                />
                {activeStepId === s.id && (
                  <div className="mt-2 flex justify-center">
                    <span className="pixel-font" style={{ color: '#8b6f47' }}>▶</span>
                  </div>
                )}
              </div>
              {isPending(s.id) && (
                <div className="flex items-center justify-between pixel-wooden-card px-3 py-2 text-sm" style={{ color: '#6b5335' }}>
                  已标记完成。2 秒内可撤销。
                  <button
                    className="pixel-wooden-button px-2 py-1 text-xs"
                    onClick={() => undoStep(s.id)}
                  >
                    撤销
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 完成按钮 */}
        <div className="relative">
          <button
            className="w-full pixel-wooden-button px-4 py-3 text-base font-medium relative overflow-hidden"
            onPointerDown={(e) => {
              // 如果已经全部完成，不处理长按
              if (allDone) return;
              
              setIsLongPressing(true);
              setLongPressProgress(0);
              longPressStartTimeRef.current = Date.now();
              
              // 更新进度
              longPressProgressIntervalRef.current = setInterval(() => {
                if (longPressStartTimeRef.current) {
                  const elapsed = Date.now() - longPressStartTimeRef.current;
                  const progress = Math.min((elapsed / 1000) * 100, 100);
                  setLongPressProgress(progress);
                }
              }, 50);
              
              // 长按1秒后触发
              longPressTimerRef.current = setTimeout(async () => {
                if (longPressProgressIntervalRef.current) {
                  clearInterval(longPressProgressIntervalRef.current);
                  longPressProgressIntervalRef.current = null;
                }
                try {
                  // 批量完成所有未完成的步骤（不触发动画）
                  const incompleteSteps = steps.filter(s => !s.completed);
                  
                  // 直接更新所有步骤状态
                  setSteps((prev) => 
                    prev.map((p) => 
                      incompleteSteps.some(s => s.id === p.id) 
                        ? { ...p, completed: true } 
                        : p
                    )
                  );
                  
                  // 批量请求完成所有步骤
                  const promises = incompleteSteps.map(async (step) => {
                    try {
                      const res = await fetch(`/api/tutorials/${tutorialId}/steps/${step.id}/complete`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ completed: true }),
                      });
                      if (!res.ok) throw new Error("更新失败");
                    } catch {
                      // 回滚失败的步骤
                      setSteps((prev) => prev.map((p) => (p.id === step.id ? { ...p, completed: false } : p)));
                    }
                  });
                  
                  await Promise.all(promises);
                  
                  // 然后完成教程
                  const res = await fetch(`/api/tutorials/${tutorialId}/complete`, {
                    method: "PATCH",
                    credentials: "include",
                  });
                  if (!res.ok) throw new Error("完成失败");
                  router.push(`/tutorial/${tutorialId}/complete`);
                } catch {
                  // 忽略错误
                } finally {
                  setIsLongPressing(false);
                  setLongPressProgress(0);
                  longPressStartTimeRef.current = null;
                }
              }, 1000);
            }}
            onPointerUp={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
              if (longPressProgressIntervalRef.current) {
                clearInterval(longPressProgressIntervalRef.current);
                longPressProgressIntervalRef.current = null;
              }
              setIsLongPressing(false);
              setLongPressProgress(0);
              longPressStartTimeRef.current = null;
            }}
            onPointerCancel={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
              if (longPressProgressIntervalRef.current) {
                clearInterval(longPressProgressIntervalRef.current);
                longPressProgressIntervalRef.current = null;
              }
              setIsLongPressing(false);
              setLongPressProgress(0);
              longPressStartTimeRef.current = null;
            }}
            onClick={async (e) => {
              // 如果正在长按，阻止点击事件
              if (isLongPressing) {
                e.preventDefault();
                return;
              }
              
              // 如果已经全部完成，直接跳转
              if (allDone) {
                try {
                  const res = await fetch(`/api/tutorials/${tutorialId}/complete`, {
                    method: "PATCH",
                    credentials: "include",
                  });
                  if (!res.ok) throw new Error("完成失败");
                  router.push(`/tutorial/${tutorialId}/complete`);
                } catch {
                  // 忽略错误
                }
              }
            }}
          >
            <span className="relative z-10">
              {allDone ? "已全部完成" : isLongPressing ? "长按完成中..." : "长按一键完成"}
            </span>
            {isLongPressing && !allDone && (
              <div 
                className="absolute inset-0 bg-opacity-30 transition-all duration-75 ease-linear"
                style={{ 
                  width: `${longPressProgress}%`,
                  backgroundColor: 'rgba(139, 111, 71, 0.3)'
                }}
              />
            )}
          </button>
        </div>
      </div>

      {openStepId && (
        <ModalDetail isOpen={!!openStepId} onClose={() => setOpenStepId(null)}>
          <StepDetailContent tutorialId={tutorialId} stepId={openStepId} />
        </ModalDetail>
      )}
    </div>
  );
}


