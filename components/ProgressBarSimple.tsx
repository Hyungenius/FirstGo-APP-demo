"use client";

interface Props {
  progress: number; // 0-1
}

export default function ProgressBarSimple({ progress }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  return (
    <div className="w-full pixel-font">
      <div className="mb-1 flex items-center justify-between text-xs" style={{ color: '#6b5335' }}>
        <span>进度</span>
        <span>{pct}%</span>
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

