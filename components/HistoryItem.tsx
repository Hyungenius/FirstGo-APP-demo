"use client";

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
  onDelete?: (id: string) => void;
  formatDate: (dateStr: string) => string;
  isEditMode?: boolean;
}

export default function HistoryItem({ item, onDelete, formatDate, isEditMode = false }: Props) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(item.id);
    }
  };

  const content = (
    <div className={`block pixel-wooden-card p-4 transition-shadow hover:shadow-lg relative ${!isEditMode ? 'cursor-pointer' : ''}`}>
      {/* 删除按钮 - 仅在编辑模式显示 */}
      {isEditMode && onDelete && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-3 right-3 pixel-wooden-button"
          style={{ 
            backgroundColor: '#dc2626', 
            color: 'white',
            minWidth: '36px',
            height: '36px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          title="删除"
        >
          <span className="text-base">🗑️</span>
        </button>
      )}
      
      <div className={`mb-2 flex items-start justify-between ${isEditMode ? 'pr-12' : ''}`}>
        <div className="flex-1">
          <h3 className="pixel-font text-lg font-medium" style={{ color: '#6b5335' }}>
            {item.title || item.input_text}
          </h3>
          {item.title && item.input_text !== item.title && (
            <p className="pixel-font mt-1 text-sm" style={{ color: '#8b6f47' }}>{item.input_text}</p>
          )}
        </div>
        {item.completed && (
          <span className="pixel-font ml-2 pixel-wooden-card px-2 py-1 text-xs whitespace-nowrap" style={{ color: '#6b5335', backgroundColor: '#e8f5e9' }}>
            已完成
          </span>
        )}
      </div>
      <ProgressBarSimple progress={item.progress} />
      <div className="pixel-font mt-2 flex items-center justify-between text-xs" style={{ color: '#8b6f47' }}>
        <span>创建于 {formatDate(item.created_at)}</span>
        {item.completed_at && <span>完成于 {formatDate(item.completed_at)}</span>}
      </div>
    </div>
  );

  // 编辑模式下，不提供链接，防止误触跳转
  if (isEditMode) {
    return <div>{content}</div>;
  }

  // 非编辑模式，点击跳转
  return (
    <Link href={`/tutorial/${item.id}`} className="block">
      {content}
    </Link>
  );
}

