"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // 可选：在这里添加错误日志记录
    // 例如：console.error('Error:', error);
    // 或者：sendToLoggingService(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">出现错误</h2>
      <p className="text-zinc-600 dark:text-zinc-400">{error.message || "未知错误"}</p>
      <button
        onClick={reset}
        className="rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-black dark:bg-zinc-200 dark:text-black dark:hover:bg-white"
      >
        重试
      </button>
    </div>
  );
}

