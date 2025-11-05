"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 检查是否已登录，如果已登录则跳转到首页
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

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
        // 登录成功后跳转到首页
        router.push("/");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "操作失败";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, mode, router]);

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setMessage("已登出");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16 pixel-font" style={{ backgroundColor: '#f5f0e8' }}>
      <div className="w-full max-w-md pixel-wooden-container p-6">
        <h1 className="pixel-font mb-4 text-2xl font-semibold" style={{ color: '#6b5335' }}>{mode === "signup" ? "注册" : "登录"}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="邮箱"
            className="pixel-font w-full px-3 py-2"
            style={{ 
              border: '3px solid #8b6f47',
              borderRadius: '6px',
              backgroundColor: '#faf5ed',
              color: '#6b5335',
              imageRendering: 'pixelated',
              boxShadow: 'inset 0 0 0 1px rgba(107, 83, 53, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="密码（至少 6 位）"
            className="pixel-font w-full px-3 py-2"
            style={{ 
              border: '3px solid #8b6f47',
              borderRadius: '6px',
              backgroundColor: '#faf5ed',
              color: '#6b5335',
              imageRendering: 'pixelated',
              boxShadow: 'inset 0 0 0 1px rgba(107, 83, 53, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full pixel-wooden-button px-4 py-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "处理中..." : mode === "signup" ? "注册" : "登录"}
          </button>
        </form>
        <div className="pixel-font mt-3 flex items-center justify-between text-sm" style={{ color: '#8b6f47' }}>
          <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="underline" style={{ color: '#6b5335' }}>
            {mode === "signup" ? "已有账号？去登录" : "没有账号？去注册"}
          </button>
          <button onClick={handleSignOut} className="underline" style={{ color: '#6b5335' }}>登出</button>
        </div>
        {message && (
          <div className="pixel-font mt-4 pixel-wooden-card p-3 text-sm" style={{ color: '#6b5335' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}


