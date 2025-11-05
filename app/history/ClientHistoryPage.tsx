"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProgressBarSimple from "@/components/ProgressBarSimple";

interface TutorialItem {
  id: string;
  title?: string | null;
  input_text: string;
  progress: number;
  completed: boolean;
  created_at: string;
  completed_at?: string | null;
}

export default function ClientHistoryPage() {
  const [items, setItems] = useState<TutorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/history", { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `加载失败（${res.status}）`);
        if (cancelled) return;
        setItems(data?.items || []);
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

  return (
    <div className="mx-auto w-full max-w-3xl p-6 pixel-font" style={{ minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="pixel-font text-2xl font-medium" style={{ color: '#6b5335' }}>历史记录</h1>
        <Link
          href="/"
          className="pixel-wooden-button px-3 py-2 text-sm"
        >
          返回首页
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="pixel-wooden-container p-8 text-center">
          <p className="pixel-font" style={{ color: '#6b5335' }}>还没有历史记录，去创建一个教程吧！</p>
          <Link
            href="/"
            className="mt-4 inline-block pixel-wooden-button px-4 py-2"
          >
            开始创建
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/tutorial/${item.id}`}
              className="block cursor-pointer pixel-wooden-card p-4 transition-shadow hover:shadow-lg"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="pixel-font text-lg font-medium" style={{ color: '#6b5335' }}>
                    {item.title || item.input_text}
                  </h3>
                  {item.title && item.input_text !== item.title && (
                    <p className="pixel-font mt-1 text-sm" style={{ color: '#8b6f47' }}>{item.input_text}</p>
                  )}
                </div>
                {item.completed && (
                  <span className="pixel-font ml-2 pixel-wooden-card px-2 py-1 text-xs" style={{ color: '#6b5335', backgroundColor: '#e8f5e9' }}>
                    已完成
                  </span>
                )}
              </div>
              <ProgressBarSimple progress={item.progress} />
              <div className="pixel-font mt-2 flex items-center justify-between text-xs" style={{ color: '#8b6f47' }}>
                <span>创建于 {formatDate(item.created_at)}</span>
                {item.completed_at && <span>完成于 {formatDate(item.completed_at)}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

