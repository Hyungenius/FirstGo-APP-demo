"use client";

import { useEffect, useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function ModalDetail({ isOpen, onClose, title, children }: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{
        animation: "fadeIn 0.2s ease-out",
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl pixel-wooden-container p-6"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "slideUp 0.2s ease-out",
        }}
      >
        <button
          onClick={onClose}
          className="pixel-wooden-button absolute right-4 top-4 p-1"
          aria-label="关闭"
          style={{ minWidth: 'auto', padding: '4px' }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b5335' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {title && (
          <h2 className="pixel-font mb-4 pr-8 text-xl font-medium" style={{ color: '#6b5335' }}>{title}</h2>
        )}
        <div className="pixel-font max-h-[70vh] overflow-y-auto" style={{ paddingRight: '8px' }}>{children}</div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

