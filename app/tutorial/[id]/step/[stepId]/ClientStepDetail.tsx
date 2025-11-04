"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

interface StepData {
  id: string;
  title: string;
  summary?: string | null;
  detail?: string | null;
  completed?: boolean;
  ord: number;
}

export default function ClientStepDetail({ tutorialId, stepId }: { tutorialId: string; stepId: string }) {
  const [step, setStep] = useState<StepData | null>(null);
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
          completed: boolean;
          ord: number;
        }) => s.id === stepId);
        if (!target) throw new Error("步骤不存在");
        if (cancelled) return;
        setStep({
          id: target.id,
          title: target.title,
          summary: target.summary,
          detail: target.detail,
          completed: target.completed,
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
    return (
      <div className="flex items-center gap-2 bg-white p-6 text-gray-600">
        <LoadingSpinner size="md" />
        加载中...
      </div>
    );
  }
  if (error || !step) {
    return <div className="bg-white p-6 text-red-600">{error || "步骤不存在"}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl bg-white p-6">
      <Link
        href={`/tutorial/${tutorialId}`}
        className="mb-4 inline-block text-sm text-gray-600 hover:underline"
      >
        ← 返回教程
      </Link>
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="mb-2 text-sm text-gray-500">步骤 {step.ord}</div>
        <h1 className="mb-3 text-2xl font-medium text-black">{step.title}</h1>
        {step.summary && (
          <p className="mb-4 text-gray-700">{step.summary}</p>
        )}
        {generating ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <LoadingSpinner size="sm" />
            正在生成详细说明...
          </div>
        ) : step.detail ? (
          <div className="mt-4 space-y-2 text-gray-800">
            <div className="whitespace-pre-line text-sm leading-relaxed">{step.detail}</div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-gray-500">详细说明待生成</div>
        )}
      </div>
    </div>
  );
}

