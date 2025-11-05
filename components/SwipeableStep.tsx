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

const LONG_PRESS_DURATION = 800; // 长按时间（毫秒）

// 数字转中文汉字
function numberToChinese(num: number): string {
  const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num >= 1 && num <= 10) {
    return chineseNumbers[num];
  }
  if (num > 10 && num <= 99) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    if (ones === 0) {
      return chineseNumbers[tens] + '十';
    }
    return chineseNumbers[tens] + '十' + chineseNumbers[ones];
  }
  // 如果超过99，返回数字本身
  return String(num);
}

export default function SwipeableStep({ ord, title, summary, completed, onComplete, onDetailClick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressCompletedRef = useRef<boolean>(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (completed) return;
    
    // 清除之前的定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    setIsLongPressing(true);
    setLongPressProgress(0);
    
    // 开始进度更新
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setLongPressProgress(progress);
    }, 16); // 约 60fps
    
    // 设置长按完成定时器
    longPressCompletedRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressCompletedRef.current = true;
      onComplete?.();
      setIsLongPressing(false);
      setLongPressProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, LONG_PRESS_DURATION);
    
    // 设置点击定时器（用于区分点击和长按）
    clickTimerRef.current = setTimeout(() => {
      // 如果长按时间还没到，说明是普通点击
      // 这里不处理，因为长按会触发完成，点击应该触发详情
    }, 100);
    
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [completed, onComplete]);

  const onPointerUp = useCallback(() => {
    // 清除所有定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // 如果长按已完成，不触发详情
    const wasLongPressCompleted = longPressCompletedRef.current;
    longPressCompletedRef.current = false;
    
    setIsLongPressing(false);
    setLongPressProgress(0);
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    
    // 如果长按未完成，说明是点击，触发详情
    if (!wasLongPressCompleted && isLongPressing) {
      // 延迟一点触发，避免与长按完成冲突
      setTimeout(() => {
        onDetailClick?.();
      }, 50);
    }
  }, [isLongPressing, onDetailClick]);

  const onPointerCancel = useCallback(() => {
    // 取消时清除所有定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    longPressCompletedRef.current = false;
    setIsLongPressing(false);
    setLongPressProgress(0);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden pixel-wooden-card ${completed ? "opacity-60" : ""}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ touchAction: 'none', borderRadius: '6px' }}
    >
      {/* 长按进度提示 */}
      {isLongPressing && !completed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-green-100/90">
          <div className="mb-2 text-base font-medium text-green-700">
            长按完成中...
          </div>
          <div className="w-3/4 h-2 bg-green-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-75 ease-linear"
              style={{ width: `${longPressProgress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-green-700">
            {Math.round(longPressProgress)}%
          </div>
        </div>
      )}
      
      <div className="relative z-10 p-4 pixel-font" style={{ backgroundColor: '#faf5ed' }}>
        <div className="mb-1 flex items-center gap-2 text-base font-medium" style={{ color: '#6b5335' }}>
          <span>第{numberToChinese(ord)}步</span>
          <span className="text-base" style={{ color: '#6b5335' }}>{title}</span>
        </div>
        {summary && (
          <div className="text-sm" style={{ color: '#6b5335' }}>{summary}</div>
        )}
        {completed && (
          <div className="mt-2 text-xs" style={{ color: '#8b6f47' }}>已完成</div>
        )}
        {!completed && (
          <div className="mt-2 text-xs" style={{ color: '#8b6f47' }}>长按完成</div>
        )}
      </div>
    </div>
  );
}


