"use client";

interface Props {
  ord: number;
  title: string;
  summary?: string;
  completed?: boolean;
}

export default function StepCard({ ord, title, summary, completed }: Props) {
  return (
    <div className={`rounded-lg border p-4 ${completed ? "opacity-60" : ""} border-zinc-200 dark:border-zinc-800`}>
      <div className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">步骤 {ord}</div>
      <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
      {summary && (
        <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{summary}</div>
      )}
    </div>
  );
}


