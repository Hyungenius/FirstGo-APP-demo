"use client";

import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function DebugSupabase() {
  useEffect(() => {
    try {
      const supabase = getSupabaseClient();
      // 仅用于本任务验证：在控制台打印 auth 对象
      console.log("[supabase.auth]", supabase.auth);
    } catch (err) {
      console.warn("Supabase 未初始化：", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

