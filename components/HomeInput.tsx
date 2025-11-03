"use client";

import { useState } from "react";

export default function HomeInput() {
  const [value, setValue] = useState("");

  return (
    <div className="w-full max-w-xl">
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        我第一次想做什么？
      </label>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="例如：第一次去健身房"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:ring-zinc-200"
        />
        <button
          type="button"
          className="rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-black disabled:opacity-50 dark:bg-zinc-200 dark:text-black dark:hover:bg-white"
          disabled={!value.trim()}
          aria-label="开始（暂不提交）"
        >
          开始
        </button>
      </div>
    </div>
  );
}


