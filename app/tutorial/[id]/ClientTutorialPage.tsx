"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SwipeableStep from "@/components/SwipeableStep";
import ModalDetail from "@/components/ModalDetail";
import StepDetailContent from "@/components/StepDetailContent";
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
    return <div className="p-6 text-gray-600">加载中...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="relative mx-auto w-full max-w-3xl bg-white p-6" style={{ minHeight: '100vh' }}>
      {/* 左侧边栏 */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-16 opacity-30"
        style={{ backgroundColor: '#f5f0e8' }}
      >
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-2xl">✦</div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 ml-20">
        {/* 标题 */}
        <div className="mb-6 rounded border border-gray-200 bg-white p-4 text-center">
          <h1 className="text-xl font-medium text-black">
            {title || "教程"}
          </h1>
        </div>

        {/* 准备部分 */}
        {items.length > 0 && (
          <div className="mb-6 rounded border border-gray-200 bg-white p-4">
            <div className="flex">
              <div className="w-20 flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <div className="flex-1 pl-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-medium text-black flex items-center gap-2">
                    <span>📦</span>
                    准备物品
                  </h2>
                  <button
                    onClick={() => setPreparationExpanded(!preparationExpanded)}
                    className="rounded border border-gray-200 px-2 py-1 text-xs text-black"
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
                    <span className="text-gray-400">▶</span>
                  </div>
                )}
              </div>
              {isPending(s.id) && (
                <div className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                  已标记完成。2 秒内可撤销。
                  <button
                    className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
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
        <button
          className="w-full rounded border border-gray-200 bg-white px-4 py-3 text-base font-medium text-black transition-colors hover:bg-gray-50 disabled:opacity-50"
          disabled={!allDone}
          onClick={async () => {
            try {
              const res = await fetch(`/api/tutorials/${tutorialId}/complete`, {
                method: "PATCH",
                credentials: "include",
              });
              if (!res.ok) throw new Error("完成失败");
              router.push(`/tutorial/${tutorialId}/complete`);
            } catch {
              // 忽略错误，已显示在 UI
            }
          }}
        >
          已全部完成
        </button>
      </div>

      {openStepId && (
        <ModalDetail isOpen={!!openStepId} onClose={() => setOpenStepId(null)}>
          <StepDetailContent tutorialId={tutorialId} stepId={openStepId} />
        </ModalDetail>
      )}
    </div>
  );
}


