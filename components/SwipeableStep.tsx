"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

interface Props {
  ord: number;
  title: string;
  summary?: string;
  completed?: boolean;
  onComplete?: () => void;
  onDetailClick?: () => void;
}

const SWIPE_THRESHOLD = 100; // 右滑阈值（像素）
const SWIPE_VELOCITY_THRESHOLD = 0.5; // 滑动速度阈值（像素/毫秒）

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
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const currentXRef = useRef<number | null>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevCompletedRef = useRef(completed);

  // 当 completed 从 true 变为 false 时（撤销），重置 isCompleting
  // 使用 useLayoutEffect 确保在渲染前同步重置状态，避免闪烁
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const prevCompleted = prevCompletedRef.current;
    prevCompletedRef.current = completed;
    
    // 如果从完成变为未完成（撤销），重置状态
    if (prevCompleted && !completed) {
      setIsCompleting(false);
      setSwipeProgress(0);
      setIsSwipeActive(false);
    }
  }, [completed]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (completed) return;
    
    // 清除之前的点击定时器
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = Date.now();
    currentXRef.current = e.clientX;
    setIsSwipeActive(true);
    setSwipeProgress(0);
    
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [completed]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (completed || !isSwipeActive || startXRef.current === null || !containerRef.current) return;
    
    currentXRef.current = e.clientX;
    const deltaX = e.clientX - startXRef.current;
    const deltaY = Math.abs(e.clientY - (startYRef.current || 0));
    
    // 只处理向右滑动，且垂直偏移不能太大（避免误触）
    if (deltaX > 0 && deltaY < 50) {
      const containerWidth = containerRef.current.offsetWidth;
      const progress = Math.min((deltaX / containerWidth) * 100, 100);
      setSwipeProgress(progress);
    } else {
      setSwipeProgress(0);
    }
  }, [completed, isSwipeActive]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (completed || startXRef.current === null || startTimeRef.current === null) {
      setIsSwipeActive(false);
      setSwipeProgress(0);
      return;
    }
    
    const endX = e.clientX;
    const endY = e.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - startXRef.current;
    const deltaY = Math.abs(endY - (startYRef.current || 0));
    const deltaTime = endTime - startTimeRef.current;
    const velocity = deltaTime > 0 ? Math.abs(deltaX) / deltaTime : 0;
    
    // 判断是否为右滑完成
    const isRightSwipe = deltaX > SWIPE_THRESHOLD && deltaY < 50 && deltaX > 0;
    const isFastSwipe = velocity > SWIPE_VELOCITY_THRESHOLD && deltaX > 50;
    
    if (isRightSwipe || isFastSwipe) {
      // 右滑完成 - 先播放动画
      setIsCompleting(true);
      setIsSwipeActive(false);
      setSwipeProgress(100);
      
      // 延迟调用 onComplete，让动画先播放
      setTimeout(() => {
        onComplete?.();
      }, 300);
    } else {
      // 判断是否为点击（移动距离很小）
      const isClick = Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10;
      
      if (isClick) {
        // 延迟触发点击，避免与滑动冲突
        clickTimerRef.current = setTimeout(() => {
          onDetailClick?.();
        }, 100);
      } else {
        // 滑动未达到阈值，重置
        setIsSwipeActive(false);
        setSwipeProgress(0);
      }
    }
    
    // 重置
    startXRef.current = null;
    startYRef.current = null;
    startTimeRef.current = null;
    currentXRef.current = null;
  }, [completed, onComplete, onDetailClick]);

  const onPointerCancel = useCallback(() => {
    setIsSwipeActive(false);
    setSwipeProgress(0);
    startXRef.current = null;
    startYRef.current = null;
    startTimeRef.current = null;
    currentXRef.current = null;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden pixel-wooden-card ${completed ? "opacity-60" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ 
        touchAction: 'pan-y', 
        borderRadius: '6px', 
        cursor: completed ? 'default' : 'grab',
        opacity: isCompleting ? 0.5 : (completed ? 0.6 : 1),
        transition: isCompleting ? 'opacity 300ms ease-out' : (completed ? 'opacity 300ms ease-out' : 'none')
      }}
    >
      {/* 右滑进度条 */}
      {isSwipeActive && !completed && !isCompleting && swipeProgress > 0 && (
        <div 
          className="absolute inset-y-0 left-0 z-10 transition-all duration-75 ease-out"
          style={{ 
            width: `${swipeProgress}%`,
            backgroundColor: 'rgba(139, 111, 71, 0.3)',
            borderRight: '3px solid #8b6f47'
          }}
        />
      )}
      
      {/* 右滑完成提示 */}
      {isSwipeActive && !completed && !isCompleting && swipeProgress > 50 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="pixel-font text-base font-medium" style={{ color: '#8b6f47' }}>
            {swipeProgress >= SWIPE_THRESHOLD ? '释放完成' : '继续右滑'}
          </div>
        </div>
      )}
      
      <div className="relative z-10 p-4 pixel-font" style={{ backgroundColor: '#faf5ed' }}>
        <div className="mb-1 flex items-center gap-2 text-base font-medium" style={{ 
          color: '#6b5335',
          textDecoration: (completed || isCompleting) ? 'line-through' : 'none',
          opacity: (completed || isCompleting) ? 0.6 : 1,
          transition: 'opacity 300ms ease-out'
        }}>
          <span>第{numberToChinese(ord)}步</span>
          <span className="text-base" style={{ color: '#6b5335' }}>{title}</span>
        </div>
        {summary && (
          <div className="text-sm" style={{ 
            color: '#6b5335',
            textDecoration: (completed || isCompleting) ? 'line-through' : 'none',
            opacity: (completed || isCompleting) ? 0.6 : 1,
            transition: 'opacity 300ms ease-out'
          }}>{summary}</div>
        )}
        {completed && (
          <div className="mt-2 text-xs" style={{ color: '#8b6f47' }}>已完成</div>
        )}
        {!completed && !isCompleting && (
          <div className="mt-2 text-xs flex items-center gap-1" style={{ color: '#8b6f47' }}>
            <span>右滑完成</span>
            <span className="inline-block animate-pulse">→</span>
          </div>
        )}
      </div>
    </div>
  );
}
