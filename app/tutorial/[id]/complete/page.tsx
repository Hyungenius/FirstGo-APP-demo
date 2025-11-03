import Link from "next/link";
import type { RouteParams } from "@/types/route";

export default async function CompletePage(ctx: RouteParams) {
  const resolvedParams = "then" in ctx.params ? await ctx.params : ctx.params;
  const id = resolvedParams?.id as string;
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">完成！</div>
      <p className="text-zinc-600 dark:text-zinc-400">你已完成本次教程，可以去勋章墙看看或返回首页。</p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-4 py-2 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          回到首页
        </Link>
        <Link
          href="/badges"
          className="rounded-md border border-zinc-300 px-4 py-2 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          去勋章墙
        </Link>
        <Link
          href={`/tutorial/${id}`}
          className="rounded-md border border-zinc-300 px-4 py-2 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          返回教程
        </Link>
      </div>
    </div>
  );
}


