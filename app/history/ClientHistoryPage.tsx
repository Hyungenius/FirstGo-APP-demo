"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HistoryItem from "@/components/HistoryItem";

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
  const [items, setItems] = useState<TutorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId || deleting) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/tutorials/${deleteConfirmId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "删除失败");
      }

      // 从列表中移除已删除的项
      setItems((prev) => prev.filter((item) => item.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (loading) {
    return <div className="p-6 pixel-font" style={{ backgroundColor: '#f5f0e8', color: '#6b5335' }}>加载中...</div>;
  }
  if (error) {
    return <div className="p-6 pixel-font" style={{ backgroundColor: '#f5f0e8', color: '#8b0000' }}>{error}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6 pixel-font" style={{ minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="pixel-font text-2xl font-medium" style={{ color: '#6b5335' }}>历史记录</h1>
        <div className="flex items-center gap-2">
          {/* 编辑/完成按钮 */}
          {items.length > 0 && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="pixel-wooden-button px-3 py-2 text-sm"
            >
              {isEditMode ? "完成" : "编辑"}
            </button>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 pixel-wooden-button px-3 py-2 text-sm"
          >
            <img 
              src="/assets/return.png" 
              alt="返回" 
              className="pixel-image"
              style={{ 
                width: 'auto',
                height: 'auto',
                maxWidth: '20px',
                maxHeight: '20px',
                objectFit: 'contain',
                imageRendering: 'pixelated'
              }}
            />
            返回首页
          </Link>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="pixel-wooden-container p-8 text-center">
          <p className="pixel-font" style={{ color: '#6b5335' }}>还没有历史记录，去创建一个教程吧！</p>
          <Link
            href="/"
            className="mt-4 inline-block pixel-wooden-button px-4 py-2"
          >
            开始创建
          </Link>
        </div>
      ) : (
        <>
          {/* 编辑模式提示 */}
          {isEditMode && (
            <div className="mb-4 pixel-wooden-card p-3 text-center" style={{ backgroundColor: '#fff3cd' }}>
              <p className="pixel-font text-sm" style={{ color: '#6b5335' }}>
                编辑模式：点击记录右上角的 🗑️ 按钮可以删除
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onDelete={handleDelete}
                formatDate={formatDate}
                isEditMode={isEditMode}
              />
            ))}
          </div>

          {/* 删除确认对话框 - 居中显示 */}
          {deleteConfirmId && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={cancelDelete}
              style={{ 
                backgroundColor: 'rgba(107, 83, 53, 0.4)',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div 
                className="pixel-wooden-container p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  backgroundColor: '#faf5ed',
                  animation: 'slideUp 0.2s ease-out'
                }}
              >
                <h3 className="pixel-font text-lg font-medium mb-4" style={{ color: '#6b5335' }}>
                  确认删除
                </h3>
                <p className="pixel-font mb-6" style={{ color: '#6b5335' }}>
                  确定要删除这条历史记录吗？此操作无法撤销。
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    className="pixel-wooden-button px-4 py-2"
                    onClick={cancelDelete}
                    disabled={deleting}
                  >
                    取消
                  </button>
                  <button
                    className="pixel-wooden-button px-4 py-2"
                    onClick={confirmDelete}
                    disabled={deleting}
                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                  >
                    {deleting ? "删除中..." : "确认删除"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

