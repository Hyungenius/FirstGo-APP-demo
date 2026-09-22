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

        {/* 评委友好提示 */}
        <div
          className="pixel-font mb-4 px-4 py-3 text-sm leading-relaxed"
          style={{
            backgroundColor: '#fffbe6',
            border: '3px dashed #8b6f47',
            borderRadius: '8px',
            color: '#6b5335',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>
            👋 评委您好！
          </div>
          本应用首次使用需要创建账号，您可以：
          <div style={{ marginTop: '6px' }}>
            ✅ <b>方式一（推荐）</b>：直接点下方“使用 Demo 账号”按钮，零输入快速体验<br/>
            ✅ <b>方式二</b>：输入任意邮箱（如 <code>judge@demo.com</code>）和任意 6 位以上密码，系统自动注册并登录
          </div>
          <div style={{ marginTop: '6px', fontSize: '12px', opacity: 0.7 }}>
            无需真实邮箱验证，也不会发送任何邮件 📬
          </div>
        </div>

        <h1 className="pixel-font mb-4 text-2xl font-semibold" style={{ color: '#6b5335' }}>
          {mode === "signup" ? "创建账号" : "登录"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="邮箱（任意即可）"
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
            placeholder="密码（至少 6 位，任意即可）"
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
            {loading ? "处理中..." : mode === "signup" ? "注册并进入" : "登录"}
          </button>
        </form>

        {/* Demo 一键按钮 */}
        <div style={{
          textAlign: 'center',
          margin: '14px 0',
          color: '#8b6f47',
          fontSize: '12px',
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '0',
            width: '45%',
            height: '1px',
            backgroundColor: '#d4c4a8'
          }} />
          <span style={{ padding: '0 8px', backgroundColor: '#faf5ed', position: 'relative', zIndex: 1 }}>或</span>
          <span style={{
            position: 'absolute',
            top: '50%',
            right: '0',
            width: '45%',
            height: '1px',
            backgroundColor: '#d4c4a8'
          }} />
        </div>
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            setMessage(null);
            const supabase = getSupabaseClient();
            const demoEmail = "judge@demo.com";
            const demoPwd = "demo123456";
            try {
              const { error: signinErr } = await supabase.auth.signInWithPassword({
                email: demoEmail,
                password: demoPwd
              });
              if (signinErr) {
                const { error: signupErr } = await supabase.auth.signUp({
                  email: demoEmail,
                  password: demoPwd
                });
                if (signupErr) throw signupErr;
                const { error: signinErr2 } = await supabase.auth.signInWithPassword({
                  email: demoEmail,
                  password: demoPwd
                });
                if (signinErr2) throw signinErr2;
              }
              setMessage("✅ 欢迎进入 First-Go！");
              setTimeout(() => router.push("/"), 500);
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : "操作失败";
              setMessage(errorMessage);
            } finally {
              setLoading(false);
            }
          }}
          className="w-full pixel-wooden-button px-4 py-2 disabled:opacity-50"
          style={{
            backgroundColor: '#8b6f47',
            color: '#faf5ed',
            border: '3px solid #6b5335',
            fontWeight: 'bold'
          }}
          disabled={loading}
        >
          🚀 使用 Demo 账号一键进入
        </button>

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

