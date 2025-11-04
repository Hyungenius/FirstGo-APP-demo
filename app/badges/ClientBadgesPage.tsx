"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Badge {
  id: string;
  awarded_at: string;
  source_tutorial?: string | null;
  badges: {
    id: string;
    key: string;
    title: string;
    description?: string | null;
    icon_url?: string | null;
  };
}

export default function ClientBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/badges", { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `加载失败（${res.status}）`);
        if (cancelled) return;
        setBadges(data?.badges || []);
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
    <div className="mx-auto w-full max-w-4xl bg-white p-6" style={{ minHeight: '100vh' }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-black">勋章墙</h1>
        <Link
          href="/"
          className="rounded border border-gray-200 px-3 py-2 text-sm text-black hover:bg-gray-50"
        >
          返回首页
        </Link>
      </div>
      {badges.length === 0 ? (
        <div className="rounded border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">还没有获得勋章，完成教程后可以获得勋章！</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded border border-gray-200 bg-white px-4 py-2 text-black transition-colors hover:bg-gray-50"
          >
            开始创建
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((item) => (
            <div
              key={item.id}
              className="rounded border border-gray-200 bg-white p-4 text-center"
            >
              <div className="mb-2 text-4xl">🏅</div>
              <h3 className="mb-1 text-lg font-medium text-black">
                {item.badges?.title || "勋章"}
              </h3>
              {item.badges?.description && (
                <p className="mb-2 text-sm text-gray-600">{item.badges.description}</p>
              )}
              <div className="text-xs text-gray-500">
                获得于 {formatDate(item.awarded_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

