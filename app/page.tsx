import Link from "next/link";
import DebugSupabase from "@/components/DebugSupabase";
import HomeCreateStarter from "@/components/HomeCreateStarter";
import AuthGuard from "@/components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex w-full max-w-3xl flex-col items-start gap-10 py-16 px-6 sm:px-10">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">我的第一次</h1>
          <HomeCreateStarter />
          <div className="flex items-center gap-4 text-sm">
            <Link href="/history" className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900">
              历史记录
            </Link>
            <Link href="/badges" className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900">
              勋章墙
            </Link>
          </div>
        </main>
        <DebugSupabase />
      </div>
    </AuthGuard>
  );
}
