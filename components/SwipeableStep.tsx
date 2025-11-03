"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  ord: number;
  title: string;
  summary?: string;
  completed?: boolean;
  onComplete?: () => void;
  onDetailClick?: () => void;
}

export default function SwipeableStep({ ord, title, summary, completed, onComplete, onDetailClick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startXRef = useRef<number | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (completed) return;
    startXRef.current = e.clientX;
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [completed]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || startXRef.current == null || completed) return;
    const delta = e.clientX - startXRef.current;
    setDragX(Math.max(0, delta));
  }, [dragging, completed]);

  const onPointerUp = useCallback(() => {
    const hasMoved = startXRef.current != null;
    const finalDragX = dragX;
    setDragging(false);
    
    // 如果移动距离很小（< 10px），认为是点击而非拖拽
    if (hasMoved && finalDragX < 10) {
      startXRef.current = null;
      setDragX(0);
      onDetailClick?.();
      return;
    }
    
    // 真正的拖拽：判断是否达到完成阈值
    if (finalDragX > 0) {
      const el = containerRef.current;
      const width = el ? el.clientWidth : 0;
      const threshold = Math.max(80, Math.floor(width * 0.7));
      if (finalDragX >= threshold) {
        onComplete?.();
      }
    }
    startXRef.current = null;
    setDragX(0);
  }, [dragX, onComplete, onDetailClick]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 ${completed ? "opacity-60" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="absolute inset-0 flex items-center justify-start bg-green-100 px-4 text-green-700 dark:bg-green-900/40 dark:text-green-200">
        ✓ 右滑完成
      </div>
      <div
        className="relative z-10 bg-white p-4 transition-transform dark:bg-black"
        style={{ transform: `translateX(${dragX}px)` }}
      >
        <div className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">步骤 {ord}</div>
        <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
        {summary && (
          <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{summary}</div>
        )}
      </div>
    </div>
  );
}


