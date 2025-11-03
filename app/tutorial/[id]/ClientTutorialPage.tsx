"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TutorialProgress from "@/components/TutorialProgress";
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

export default function ClientTutorialPage({ tutorialId }: { tutorialId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [steps, setSteps] = useState<Step[]>([]);
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
    return <div className="p-6 text-zinc-600 dark:text-zinc-400">加载中...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{title || "教程"}</h1>
      <TutorialProgress total={steps.length} completed={completed} />
      <div className="mt-4">
        <button
          className="rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-black disabled:opacity-50 dark:bg-zinc-200 dark:text-black dark:hover:bg-white"
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
          全部完成
        </button>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4">
        {steps.map((s) => (
          <div key={s.id} className="space-y-2">
            <SwipeableStep
              ord={s.ord}
              title={s.title}
              summary={s.summary || undefined}
              completed={s.completed}
              onDetailClick={() => setOpenStepId(s.id)}
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
                  } catch (e) {
                    // 回滚
                    setSteps((prev) => prev.map((p) => (p.id === s.id ? { ...p, completed: false } : p)));
                  } finally {
                    pendingSetRef.current.delete(s.id);
                    delete timersRef.current[s.id];
                  }
                }, 2000);
              }}
            />
            {isPending(s.id) && (
              <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
                已标记完成。2 秒内可撤销。
                <button
                  className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  onClick={() => undoStep(s.id)}
                >
                  撤销
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {openStepId && (
        <ModalDetail isOpen={!!openStepId} onClose={() => setOpenStepId(null)}>
          <StepDetailContent tutorialId={tutorialId} stepId={openStepId} />
        </ModalDetail>
      )}
    </div>
  );
}


