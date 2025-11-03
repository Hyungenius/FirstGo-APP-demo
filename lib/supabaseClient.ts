import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseClient 仅应在浏览器环境调用");
  }
  if (browserClient) return browserClient;
  // 使用 auth-helpers 的客户端，自动与 Next.js cookies 同步，便于服务端验证会话
  browserClient = createClientComponentClient();
  return browserClient;
}


