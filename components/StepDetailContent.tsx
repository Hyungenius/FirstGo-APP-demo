"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface StepDetailContentProps {
  tutorialId: string;
  stepId: string;
}

export default function StepDetailContent({ tutorialId, stepId }: StepDetailContentProps) {
  const [step, setStep] = useState<{
    title: string;
    summary?: string | null;
    detail?: string | null;
    ord: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tutorials/${tutorialId}`, { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `加载失败（${res.status}）`);
        const target = (data?.steps || []).find((s: {
          id: string;
          title: string;
          summary: string | null;
          detail: string | null;
          ord: number;
        }) => s.id === stepId);
        if (!target) throw new Error("步骤不存在");
        if (cancelled) return;
        setStep({
          title: target.title,
          summary: target.summary,
          detail: target.detail,
          ord: target.ord,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tutorialId, stepId]);

  // 如果没有 detail，尝试生成
  useEffect(() => {
    if (loading || !step || step.detail || generating) return;
    let cancelled = false;
    (async () => {
      setGenerating(true);
      try {
        const res = await fetch(`/api/tutorials/${tutorialId}/steps/${stepId}/detail`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "生成失败");
        if (cancelled) return;
        setStep((prev) => (prev ? { ...prev, detail: data.detail } : null));
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "生成详细说明失败";
        if (!cancelled) setError(errorMessage);
      } finally {
        if (!cancelled) setGenerating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, tutorialId, stepId, loading, generating]);

  if (loading) {
    return <div className="p-4 text-zinc-600 dark:text-zinc-400">加载中...</div>;
  }
  if (error || !step) {
    return <div className="p-4 text-red-600">{error || "步骤不存在"}</div>;
  }

  return (
    <div>
      <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">步骤 {step.ord}</div>
      <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{step.title}</h3>
      {step.summary && (
        <p className="mb-4 text-zinc-700 dark:text-zinc-300">{step.summary}</p>
      )}
      {generating ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <LoadingSpinner size="sm" />
          正在生成详细说明...
        </div>
      ) : step.detail ? (
        <div className="mt-4 space-y-2 text-zinc-800 dark:text-zinc-200">
          <div className="whitespace-pre-line text-sm leading-relaxed">{step.detail}</div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">详细说明待生成</div>
      )}
    </div>
  );
}

