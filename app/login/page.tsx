"use client";

import { useCallback, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = getSupabaseClient();
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("注册成功（若启用邮件确认，请查收邮箱确认后再登录）");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("登录成功");
      }
    } catch (err: any) {
      setMessage(err?.message ?? "操作失败");
    } finally {
      setLoading(false);
    }
  }, [email, password, mode]);

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setMessage("已登出");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black">
        <h1 className="mb-4 text-2xl font-semibold text-black dark:text-zinc-50">{mode === "signup" ? "注册" : "登录"}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="邮箱"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:ring-zinc-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="密码（至少 6 位）"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 dark:border-zinc-700 dark:bg-black dark:text-zinc-50 dark:focus:ring-zinc-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-black disabled:opacity-50 dark:bg-zinc-200 dark:text-black dark:hover:bg-white"
            disabled={loading}
          >
            {loading ? "处理中..." : mode === "signup" ? "注册" : "登录"}
          </button>
        </form>
        <div className="mt-3 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="underline">
            {mode === "signup" ? "已有账号？去登录" : "没有账号？去注册"}
          </button>
          <button onClick={handleSignOut} className="underline">登出</button>
        </div>
        {message && (
          <div className="mt-4 rounded-md border border-zinc-300 p-3 text-sm text-zinc-800 dark:border-zinc-700 dark:text-zinc-200">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}


