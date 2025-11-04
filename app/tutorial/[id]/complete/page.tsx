import Link from "next/link";
import type { RouteParams } from "@/types/route";

export default async function CompletePage(ctx: RouteParams) {
  const resolvedParams = "then" in ctx.params ? await ctx.params : ctx.params;
  const id = resolvedParams?.id as string;
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-6 bg-white p-6 text-center">
      <div className="text-3xl font-medium text-black">完成！</div>
      <p className="text-gray-600">你已完成本次教程，可以去勋章墙看看或返回首页。</p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded border border-gray-200 bg-white px-4 py-2 text-black hover:bg-gray-50"
        >
          回到首页
        </Link>
        <Link
          href="/badges"
          className="rounded border border-gray-200 bg-white px-4 py-2 text-black hover:bg-gray-50"
        >
          去勋章墙
        </Link>
        <Link
          href={`/tutorial/${id}`}
          className="rounded border border-gray-200 bg-white px-4 py-2 text-black hover:bg-gray-50"
        >
          返回教程
        </Link>
      </div>
    </div>
  );
}


