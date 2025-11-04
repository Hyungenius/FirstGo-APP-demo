import Link from "next/link";
import DebugSupabase from "@/components/DebugSupabase";
import HomeCreateStarter from "@/components/HomeCreateStarter";
import AuthGuard from "@/components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <div className="relative flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f5f0e8' }}>
        {/* 状态栏 */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 text-sm" style={{ color: '#4a4a4a' }}>
          <span className="pixel-font">12:00</span>
          <div className="flex items-center gap-2">
            <span className="pixel-font">🏆</span>
            <span className="pixel-font">🕐</span>
          </div>
        </div>

        {/* 主要内容区域 */}
        <main className="relative flex w-full max-w-3xl flex-col items-center gap-6 py-20 px-6 sm:px-10">
          {/* 左侧角色和对话气泡 */}
          <div className="absolute left-4 top-32 z-10 hidden md:block">
            <div className="relative">
              {/* 对话气泡 */}
              <div 
                className="pixel-font absolute -top-16 left-8 w-48 rounded-lg px-4 py-3 text-sm"
                style={{ 
                  backgroundColor: '#ffffff',
                  border: '3px solid #8b6f47',
                  color: '#4a4a4a'
                }}
              >
                <div>嘿! 没想好做什么?</div>
                <div>不如试试......</div>
              </div>
              {/* 角色（简化版像素风格） */}
              <div className="relative">
                <div className="pixel-font text-6xl">🤠</div>
              </div>
            </div>
          </div>

          {/* 右侧木块堆叠 */}
          <div className="absolute right-4 top-40 z-0 hidden md:block">
            <div className="flex flex-col items-end gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="pixel-font"
                  style={{
                    width: `${20 + i * 8}px`,
                    height: '12px',
                    backgroundColor: '#8b6f47',
                    border: '2px solid #6b5335',
                    marginLeft: `${i * 2}px`
                  }}
                />
              ))}
            </div>
          </div>

          {/* 标题 */}
          <h1 
            className="pixel-font text-4xl font-semibold mb-4"
            style={{ color: '#4a4a4a' }}
          >
            第一次
          </h1>

          {/* 输入区域 */}
          <div 
            className="pixel-font relative w-full max-w-xl rounded-lg p-6"
            style={{ 
              backgroundColor: '#faf5ed',
              border: '4px solid #8b6f47'
            }}
          >
            <HomeCreateStarter />
          </div>

          {/* 底部链接 */}
          <div className="flex items-center gap-4 text-sm pixel-font">
            <Link 
              href="/history" 
              className="pixel-font rounded-md px-4 py-2 transition-colors hover:opacity-80"
              style={{ 
                border: '2px solid #8b6f47',
                color: '#4a4a4a',
                backgroundColor: '#faf5ed'
              }}
            >
              历史记录
            </Link>
            <Link 
              href="/badges" 
              className="pixel-font rounded-md px-4 py-2 transition-colors hover:opacity-80"
              style={{ 
                border: '2px solid #8b6f47',
                color: '#4a4a4a',
                backgroundColor: '#faf5ed'
              }}
            >
              勋章墙
            </Link>
          </div>
        </main>
        <DebugSupabase />
      </div>
    </AuthGuard>
  );
}
