import Link from "next/link";
import type { RouteParams } from "@/types/route";

export default async function CompletePage(ctx: RouteParams) {
  const resolvedParams = "then" in ctx.params ? await ctx.params : ctx.params;
  const id = resolvedParams?.id as string;
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center pixel-font" style={{ backgroundColor: '#f5f0e8' }}>
      {/* 视频播放 */}
      <div className="w-full max-w-md pixel-wooden-container p-4">
        <video
          src="/assets/done.mov"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto"
          style={{
            objectFit: 'contain',
            imageRendering: 'pixelated',
            borderRadius: '4px'
          }}
        >
          您的浏览器不支持视频播放。
        </video>
      </div>
      <div className="pixel-font text-3xl font-medium" style={{ color: '#6b5335' }}>完成！</div>
      <p className="pixel-font" style={{ color: '#6b5335' }}>你已完成本次教程，可以去勋章墙看看或返回首页。</p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="pixel-wooden-button px-4 py-2"
        >
          回到首页
        </Link>
        <Link
          href="/badges"
          className="pixel-wooden-button px-4 py-2"
        >
          去勋章墙
        </Link>
        <Link
          href={`/tutorial/${id}`}
          className="pixel-wooden-button px-4 py-2"
        >
          返回教程
        </Link>
      </div>
    </div>
  );
}


