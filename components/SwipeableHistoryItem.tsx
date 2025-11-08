"use client";

import { useCallback, useRef, useState } from "react";
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

interface Props {
  item: TutorialItem;
  onDelete: (id: string) => void;
  formatDate: (dateStr: string) => string;
}

const SWIPE_THRESHOLD = 80; // 右滑阈值（像素）
const DELETE_BUTTON_WIDTH = 80; // 删除按钮宽度

export default function SwipeableHistoryItem({ item, onDelete, formatDate }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const currentOffsetRef = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // 如果点击的是删除按钮，不处理滑动
    if ((e.target as HTMLElement).closest('.delete-button')) {
      return;
    }
    
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    currentOffsetRef.current = swipeOffset;
    setIsSwipeActive(true);
    
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [swipeOffset]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isSwipeActive || startXRef.current === null || !containerRef.current) return;
    
    const deltaX = e.clientX - startXRef.current;
    const deltaY = Math.abs(e.clientY - (startYRef.current || 0));
    
    // 只处理向右滑动，且垂直偏移不能太大（避免误触）
    if (deltaX > 0 && deltaY < 50) {
      const newOffset = Math.min(
        DELETE_BUTTON_WIDTH,
        Math.max(0, currentOffsetRef.current + deltaX)
      );
      setSwipeOffset(newOffset);
    } else if (deltaX < 0 && currentOffsetRef.current > 0) {
      // 向左滑动，恢复位置
      const newOffset = Math.max(0, currentOffsetRef.current + deltaX);
      setSwipeOffset(newOffset);
    }
  }, [isSwipeActive]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (startXRef.current === null) {
      setIsSwipeActive(false);
      return;
    }
    
    const deltaX = e.clientX - startXRef.current;
    
    // 判断是否应该显示删除按钮
    if (deltaX > SWIPE_THRESHOLD || swipeOffset > SWIPE_THRESHOLD) {
      // 显示删除按钮
      setSwipeOffset(DELETE_BUTTON_WIDTH);
    } else {
      // 恢复位置
      setSwipeOffset(0);
    }
    
    setIsSwipeActive(false);
    startXRef.current = null;
    startYRef.current = null;
  }, [swipeOffset]);

  const onPointerCancel = useCallback(() => {
    setIsSwipeActive(false);
    setSwipeOffset(0);
    startXRef.current = null;
    startYRef.current = null;
  }, []);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 隐藏删除按钮
    setSwipeOffset(0);
    onDelete(item.id);
  }, [item.id, onDelete]);

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    // 如果显示了删除按钮，点击链接时先隐藏删除按钮，不导航
    if (swipeOffset > 0) {
      e.preventDefault();
      setSwipeOffset(0);
    }
  }, [swipeOffset]);

  return (
    <div className="relative overflow-hidden" style={{ touchAction: 'pan-x pan-y' }}>
      {/* 删除按钮背景 */}
      <div 
        className="absolute inset-y-0 left-0 flex items-center justify-center bg-red-500 z-10"
        style={{ 
          width: `${DELETE_BUTTON_WIDTH}px`,
          transform: `translateX(${-DELETE_BUTTON_WIDTH + swipeOffset}px)`,
          transition: isSwipeActive ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        <button
          className="delete-button pixel-wooden-button px-4 py-2 text-white"
          onClick={handleDeleteClick}
          style={{ backgroundColor: '#dc2626' }}
        >
          🗑️
        </button>
      </div>
      
      {/* 主要内容 */}
      <div
        ref={containerRef}
        className="relative z-20 bg-transparent"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwipeActive ? 'none' : 'transform 0.3s ease-out',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <Link
          href={`/tutorial/${item.id}`}
          className="block cursor-pointer pixel-wooden-card p-4 transition-shadow hover:shadow-lg"
          onClick={handleLinkClick}
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
      </div>
    </div>
  );
}

