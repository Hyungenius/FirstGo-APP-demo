"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
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
        const res = await fetch(`/api/tutorials/${tutorialId}/steps/${stepId}/generate-detail`, {
          method: "POST",
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
    return <div className="p-4 text-gray-600">加载中...</div>;
  }
  if (error || !step) {
    return <div className="p-4 text-red-600">{error || "步骤不存在"}</div>;
  }

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">步骤 {step.ord}</div>
      <h3 className="mb-3 text-xl font-medium text-black">{step.title}</h3>
      {step.summary && (
        <p className="mb-4 text-gray-700">{step.summary}</p>
      )}
      {generating ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <LoadingSpinner size="sm" />
          正在生成详细说明...
        </div>
      ) : step.detail ? (
        <div className="mt-4 space-y-2 text-gray-800 prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-semibold mb-3 mt-4 text-black">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3 text-black">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-2 text-black">{children}</h3>,
              p: ({ children }) => <p className="mb-3 text-gray-800">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 ml-4">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 ml-4">{children}</ol>,
              li: ({ children }) => <li className="text-gray-800">{children}</li>,
              code: ({ children }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
            } as Components}
          >
            {step.detail}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="mt-4 text-sm text-gray-500">详细说明待生成</div>
      )}
    </div>
  );
}

