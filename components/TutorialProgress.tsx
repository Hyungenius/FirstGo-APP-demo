"use client";

interface Props {
  total: number;
  completed: number;
}

export default function TutorialProgress({ total, completed }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="w-full pixel-font">
      <div className="mb-1 flex items-center justify-between text-xs" style={{ color: '#6b5335' }}>
        <span>进度</span>
        <span>
          {completed}/{total}（{pct}%）
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden pixel-wooden-card" style={{ padding: '2px' }}>
        <div
          className="h-full transition-all"
          style={{ 
            width: `${pct}%`,
            backgroundColor: '#8b6f47',
            imageRendering: 'pixelated'
          }}
        />
      </div>
    </div>
  );
}


