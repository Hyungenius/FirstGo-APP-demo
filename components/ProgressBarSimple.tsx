"use client";

interface Props {
  progress: number; // 0-1
}

export default function ProgressBarSimple({ progress }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
        <span>进度</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-gray-900 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

