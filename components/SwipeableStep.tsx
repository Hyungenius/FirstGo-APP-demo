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
  const currentDragXRef = useRef<number>(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (completed) return;
    startXRef.current = e.clientX;
    currentDragXRef.current = 0;
    setDragging(true);
    setDragX(0);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [completed]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || startXRef.current == null || completed) return;
    const delta = e.clientX - startXRef.current;
    const newDragX = Math.max(0, delta);
    currentDragXRef.current = newDragX;
    setDragX(newDragX);
  }, [dragging, completed]);

  const onPointerUp = useCallback(() => {
    const hasMoved = startXRef.current != null;
    const finalDragX = currentDragXRef.current;
    setDragging(false);
    
    // 如果移动距离很小（< 10px），认为是点击而非拖拽
    if (hasMoved && finalDragX < 10) {
      startXRef.current = null;
      currentDragXRef.current = 0;
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
    currentDragXRef.current = 0;
    setDragX(0);
  }, [onComplete, onDetailClick]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded border border-gray-200 bg-white ${completed ? "opacity-60" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ touchAction: 'none' }}
    >
      <div className="absolute inset-0 flex items-center justify-start bg-green-100 px-4 text-green-700">
        ✓ 右滑完成
      </div>
      <div
        className="relative z-10 bg-white p-4 text-center transition-transform"
        style={{ transform: `translateX(${dragX}px)` }}
      >
        <div className="mb-2 text-base font-medium text-black">
          第{ord === 1 ? '一' : ord === 2 ? '二' : ord === 3 ? '三' : ord === 4 ? '四' : ord === 5 ? '五' : ord === 6 ? '六' : ord}步
        </div>
        <div className="mb-1 text-base text-black">{title}</div>
        {summary && (
          <div className="text-sm text-black">{summary}</div>
        )}
        {completed && (
          <div className="mt-2 text-xs text-gray-500">已完成</div>
        )}
      </div>
    </div>
  );
}


