"use client";

import { useCallback, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Props {
  className?: string;
  onCreated?: (tutorialId: string) => void;
  onError?: (message: string) => void;
}

export default function InputFirstThing({ className, onCreated, onError }: Props) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const input = value.trim();
    if (!input || loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/tutorials/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ input_text: input }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || `创建失败（${res.status}）`;
        setMessage(msg);
        onError?.(msg);
        return;
      }
      const tutorialId = String(data?.tutorialId || "");
      if (tutorialId) onCreated?.(tutorialId);
      setMessage("创建成功");
    } catch (err: any) {
      const msg = err?.message ?? "网络错误";
      setMessage(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [value, loading, onCreated, onError]);

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        我第一次想做什么？
      </label>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="例如：第一次去健身房"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:ring-zinc-200"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-black disabled:opacity-50 dark:bg-zinc-200 dark:text-black dark:hover:bg-white"
          disabled={!value.trim() || loading}
        >
          {loading && <LoadingSpinner size="sm" />}
          {loading ? "生成中..." : "开始"}
        </button>
      </div>
      {message && (
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</div>
      )}
    </div>
  );
}


