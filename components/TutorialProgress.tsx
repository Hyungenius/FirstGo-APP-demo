"use client";

interface Props {
  total: number;
  completed: number;
}

export default function TutorialProgress({ total, completed }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
        <span>进度</span>
        <span>
          {completed}/{total}（{pct}%）
        </span>
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


