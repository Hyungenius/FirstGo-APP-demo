"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    return <div className="p-6 text-zinc-600 dark:text-zinc-400">加载中...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl bg-white p-6" style={{ minHeight: '100vh' }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-black">历史记录</h1>
        <Link
          href="/"
          className="rounded border border-gray-200 px-3 py-2 text-sm text-black hover:bg-gray-50"
        >
          返回首页
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="rounded border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">还没有历史记录，去创建一个教程吧！</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded border border-gray-200 bg-white px-4 py-2 text-black transition-colors hover:bg-gray-50"
          >
            开始创建
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer rounded border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              onClick={() => router.push(`/tutorial/${item.id}`)}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-black">
                    {item.title || item.input_text}
                  </h3>
                  {item.title && item.input_text !== item.title && (
                    <p className="mt-1 text-sm text-gray-500">{item.input_text}</p>
                  )}
                </div>
                {item.completed && (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                    已完成
                  </span>
                )}
              </div>
              <ProgressBarSimple progress={item.progress} />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>创建于 {formatDate(item.created_at)}</span>
                {item.completed_at && <span>完成于 {formatDate(item.completed_at)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

