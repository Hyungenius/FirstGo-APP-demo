"use client";

import React, { useCallback, useState, useImperativeHandle, forwardRef } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Props {
  className?: string;
  onCreated?: (tutorialId: string) => void;
  onError?: (message: string) => void;
  initialValue?: string;
  onQuickStart?: (text: string) => void;
}

export interface InputFirstThingRef {
  setValueAndSubmit: (text: string) => void;
}

const InputFirstThing = forwardRef<InputFirstThingRef, Props>(
  function InputFirstThing({ className, onCreated, onError, initialValue }, ref) {
  const [value, setValue] = useState(initialValue || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 当 initialValue 变化时更新 value
  React.useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "网络错误";
      setMessage(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [value, loading, onCreated, onError]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    setValueAndSubmit: async (text: string) => {
      const input = text.trim();
      if (!input) return;
      setValue(input);
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
      } catch (err) {
        const msg = err instanceof Error ? err.message : "网络错误";
        setMessage(msg);
        onError?.(msg);
      } finally {
        setLoading(false);
      }
    },
  }));

  return (
    <div className={className} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div className="flex flex-col gap-4" style={{ width: '100%', maxWidth: '100%' }}>
        {/* 输入行 */}
        <div className="flex items-center gap-2 sm:gap-3" style={{ width: '100%', maxWidth: '100%' }}>
          <span className="pixel-font text-sm sm:text-base flex-shrink-0" style={{ color: '#6b5335' }}>第一次</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="健身"
            className="pixel-font flex-1 px-2 sm:px-3 py-2 text-sm sm:text-base placeholder:opacity-60 focus:outline-none"
            style={{ 
              border: '3px solid #8b6f47',
              borderRadius: '6px',
              backgroundColor: '#faf5ed',
              color: '#6b5335',
              imageRendering: 'pixelated',
              boxShadow: 'inset 0 0 0 1px rgba(107, 83, 53, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
              minWidth: 0,
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>
        {/* 开始计划按钮 */}
        <button
          type="button"
          onClick={handleSubmit}
          className="pixel-wooden-button mx-auto flex items-center justify-center gap-2 px-6 py-2 text-base disabled:opacity-50"
          disabled={!value.trim() || loading}
        >
          {loading && <LoadingSpinner size="sm" />}
          {loading ? "生成中..." : "开始计划"}
        </button>
      </div>
      {message && (
        <div className="pixel-font mt-2 text-sm" style={{ color: '#6b5335' }}>{message}</div>
      )}
    </div>
  );
  }
);

export default InputFirstThing;


