"use client";

interface Props {
  total: number;
  completed: number;
}

export default function TutorialProgress({ total, completed }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <span>进度</span>
        <span>
          {completed}/{total}（{pct}%）
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-zinc-900 transition-all dark:bg-zinc-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}


