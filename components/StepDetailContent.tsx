"use client";

import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
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

  // 加载步骤基础数据
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

  // 统一的 AI 调用函数：获取并设置详细说明
  const fetchAndSetDetail = useCallback(async () => {
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tutorials/${tutorialId}/steps/${stepId}/generate-detail`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData?.error || `生成失败（${response.status}）`);
      }
      
      // 立即使用返回的 JSON 数据更新本地状态
      const newDetail = responseData.detail || null;
      if (newDetail) {
        setStep((prev) => {
          if (!prev) return null;
          return { ...prev, detail: newDetail };
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "生成详细说明失败";
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  }, [tutorialId, stepId]);

  // 如果没有 detail，自动生成
  useEffect(() => {
    // 只有当加载完成、步骤存在、且没有 detail、且不在生成中时，才触发生成
    if (loading || !step || step.detail || generating) return;
    
    fetchAndSetDetail();
  }, [tutorialId, stepId, loading, step?.detail, generating, fetchAndSetDetail]);

  if (loading) {
    return <div className="pixel-font p-4" style={{ color: '#6b5335' }}>加载中...</div>;
  }
  if (error || !step) {
    return <div className="pixel-font p-4" style={{ color: '#8b0000' }}>{error || "步骤不存在"}</div>;
  }

  return (
    <div className="pixel-font" style={{ paddingTop: '15px' }}>
      <div className="mb-2 text-sm" style={{ color: '#8b6f47' }}>步骤 {step.ord}</div>
      <h3 className="mb-3 text-xl font-medium" style={{ color: '#6b5335' }}>{step.title}</h3>
      {step.summary && (
        <p className="mb-4" style={{ color: '#6b5335' }}>{step.summary}</p>
      )}
      {generating ? (
        <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: '#8b6f47' }}>
          <LoadingSpinner size="sm" />
          正在生成详细说明...
        </div>
      ) : step.detail ? (
        <div className="mt-4 space-y-2 prose prose-sm max-w-none" style={{ color: '#6b5335' }}>
          <ReactMarkdown
            components={{
              h1: ({ children }: { children?: ReactNode }) => <h1 className="pixel-font text-xl font-semibold mb-3 mt-4" style={{ color: '#6b5335', fontWeight: 600 }}>{children}</h1>,
              h2: ({ children }: { children?: ReactNode }) => <h2 className="pixel-font text-lg font-semibold mb-2 mt-3" style={{ color: '#6b5335', fontWeight: 600 }}>{children}</h2>,
              h3: ({ children }: { children?: ReactNode }) => <h3 className="pixel-font text-base font-semibold mb-2 mt-2" style={{ color: '#6b5335', fontWeight: 600 }}>{children}</h3>,
              p: ({ children }: { children?: ReactNode }) => <p className="pixel-font mb-3" style={{ color: '#6b5335' }}>{children}</p>,
              strong: ({ children }: { children?: ReactNode }) => <strong className="pixel-font font-semibold" style={{ color: '#6b5335', fontWeight: 600 }}>{children}</strong>,
              em: ({ children }: { children?: ReactNode }) => <em className="pixel-font italic">{children}</em>,
              ul: ({ children }: { children?: ReactNode }) => <ul className="pixel-font list-disc list-inside mb-3 space-y-1 ml-4">{children}</ul>,
              ol: ({ children }: { children?: ReactNode }) => <ol className="pixel-font list-decimal list-inside mb-3 space-y-1 ml-4">{children}</ol>,
              li: ({ children }: { children?: ReactNode }) => <li className="pixel-font" style={{ color: '#6b5335' }}>{children}</li>,
              code: ({ children }: { children?: ReactNode }) => <code className="pixel-font px-1.5 py-0.5 text-sm font-mono pixel-wooden-card" style={{ color: '#6b5335' }}>{children}</code>,
            } as Components}
          >
            {step.detail}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-3 text-sm" style={{ color: '#8b6f47' }}>详细说明待生成</div>
          <button
            onClick={fetchAndSetDetail}
            disabled={generating}
            className="pixel-wooden-button px-4 py-2 text-sm"
            style={{ opacity: generating ? 0.6 : 1, cursor: generating ? 'not-allowed' : 'pointer' }}
          >
            {generating ? "生成中..." : "生成详细说明"}
          </button>
        </div>
      )}
    </div>
  );
}

