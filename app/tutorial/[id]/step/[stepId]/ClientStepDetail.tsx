"use client";

import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
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

  // 使用 ref 跟踪取消状态，避免清理函数导致的状态更新问题
  const cancelledRef = useRef(false);
  
  // 如果没有 detail，尝试生成
  useEffect(() => {
    if (loading || !step || step.detail || generating) return;
    
    // 重置取消标志
    cancelledRef.current = false;
    
    const handleGenerateDetail = async () => {
      setGenerating(true);
      setError(null);
      
      try {
        // 调用生成详细教程的 API
        const response = await fetch(`/api/tutorials/${tutorialId}/steps/${stepId}/generate-detail`, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
        
        // 确保正确 await 响应
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData?.error || `生成失败（${response.status}）`);
        }
        
        // 检查是否已取消（使用 ref，这样即使组件重新渲染也能正确判断）
        if (cancelledRef.current) {
          return;
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
        if (!cancelledRef.current) {
          const errorMessage = e instanceof Error ? e.message : "生成详细说明失败";
          setError(errorMessage);
        }
      } finally {
        // 最重要的：在所有操作完成后（无论成功还是失败），必须设置 setIsLoading(false)
        if (!cancelledRef.current) {
          setGenerating(false);
        }
      }
    };
    
    handleGenerateDetail();
    
    return () => {
      cancelledRef.current = true;
    };
  }, [tutorialId, stepId, loading, generating, step?.detail]); // 只依赖 step.detail，而不是整个 step 对象

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 pixel-font" style={{ backgroundColor: '#f5f0e8', color: '#6b5335' }}>
        <LoadingSpinner size="md" />
        加载中...
      </div>
    );
  }
  if (error || !step) {
    return <div className="p-6 pixel-font" style={{ backgroundColor: '#f5f0e8', color: '#8b0000' }}>{error || "步骤不存在"}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6 pixel-font" style={{ backgroundColor: '#f5f0e8', minHeight: '100vh' }}>
      <Link
        href={`/tutorial/${tutorialId}`}
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
        返回教程
      </Link>
      <div className="pixel-wooden-container p-6">
        <div className="pixel-font mb-2 text-sm" style={{ color: '#8b6f47' }}>步骤 {step.ord}</div>
        <h1 className="pixel-font mb-3 text-2xl font-medium" style={{ color: '#6b5335' }}>{step.title}</h1>
        {step.summary && (
          <p className="pixel-font mb-4" style={{ color: '#6b5335' }}>{step.summary}</p>
        )}
        {generating ? (
          <div className="pixel-font mt-4 flex items-center gap-2 text-sm" style={{ color: '#8b6f47' }}>
            <LoadingSpinner size="sm" />
            正在生成详细说明...
          </div>
        ) : step.detail ? (
          <div className="pixel-font mt-4 space-y-2 prose prose-sm max-w-none" style={{ color: '#6b5335' }}>
            <ReactMarkdown
              components={{
                h1: ({ children }: { children?: ReactNode }) => <h1 className="pixel-font text-xl font-semibold mb-3 mt-4" style={{ color: '#6b5335' }}>{children}</h1>,
                h2: ({ children }: { children?: ReactNode }) => <h2 className="pixel-font text-lg font-semibold mb-2 mt-3" style={{ color: '#6b5335' }}>{children}</h2>,
                h3: ({ children }: { children?: ReactNode }) => <h3 className="pixel-font text-base font-semibold mb-2 mt-2" style={{ color: '#6b5335' }}>{children}</h3>,
                p: ({ children }: { children?: ReactNode }) => <p className="pixel-font mb-3" style={{ color: '#6b5335' }}>{children}</p>,
                strong: ({ children }: { children?: ReactNode }) => <strong className="pixel-font font-semibold" style={{ color: '#6b5335' }}>{children}</strong>,
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
          <div className="pixel-font mt-4 text-sm" style={{ color: '#8b6f47' }}>详细说明待生成</div>
        )}
      </div>
    </div>
  );
}

