import Link from "next/link";
import DebugSupabase from "@/components/DebugSupabase";
import HomeCreateStarter from "@/components/HomeCreateStarter";
import AuthGuard from "@/components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <div className="relative flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f5f0e8' }}>
        {/* 状态栏 - 显示图标 */}
        <div className="absolute top-0 right-0 flex items-center gap-4 px-4 py-2 z-20">
          <Link href="/badges" className="cursor-pointer transition-opacity hover:opacity-70">
            <img 
              src="/assets/prize.PNG" 
              alt="勋章墙" 
              className="pixel-image"
              style={{ 
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                imageRendering: 'pixelated'
              }}
            />
          </Link>
          <Link href="/history" className="cursor-pointer transition-opacity hover:opacity-70">
            <img 
              src="/assets/clock.PNG" 
              alt="历史记录" 
              className="pixel-image"
              style={{ 
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                imageRendering: 'pixelated'
              }}
            />
          </Link>
        </div>

        {/* 主要内容区域 */}
        <main className="relative flex w-full max-w-5xl flex-col gap-8 py-20 px-6 sm:px-10">
          {/* 上部分：对话气泡和木块堆（横向布局） */}
          <div className="flex flex-row items-start justify-center gap-4 w-full -mt-8">
            {/* 左侧：对话气泡（带尾巴的圆角矩形，包含牛仔角色） */}
            <div className="relative">
              <div 
                className="pixel-font rounded-lg px-6 py-4 text-sm relative flex items-center gap-3"
                style={{ 
                  backgroundColor: '#ffffff',
                  border: '3px solid #8b6f47',
                  borderRadius: '12px',
                  color: '#4a4a4a',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {/* 牛仔角色 */}
                <img 
                  src="/assets/cowboy.PNG" 
                  alt="牛仔角色" 
                  className="pixel-image flex-shrink-0"
                  style={{ 
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '80px',
                    maxHeight: '80px',
                    objectFit: 'contain',
                    imageRendering: 'pixelated'
                  }}
                />
                {/* 对话文本 */}
                <div className="flex flex-col">
                  <div>嘿! 没想好做什么?</div>
                  <div>不如试试......</div>
                </div>
              </div>
              {/* 气泡尾巴 */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '20px',
                  width: '0',
                  height: '0',
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '8px solid #8b6f47',
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '21px',
                  width: '0',
                  height: '0',
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: '7px solid #ffffff',
                }}
              />
            </div>

            {/* 右侧：木块堆叠区域（倒转：1、2、3、4块，居中排列） */}
            <div className="flex flex-col items-center gap-1">
              {/* 1块 */}
              <div className="flex gap-1">
                <img
                  src="/assets/wood.PNG"
                  alt="木块"
                  className="pixel-image"
                  style={{
                    width: '64px',
                    height: 'auto',
                    objectFit: 'contain',
                    imageRendering: 'pixelated'
                  }}
                />
              </div>
              {/* 2块 */}
              <div className="flex gap-1">
                {[1, 2].map((i) => (
                  <img
                    key={i}
                    src="/assets/wood.PNG"
                    alt="木块"
                    className="pixel-image"
                    style={{
                      width: '64px',
                      height: 'auto',
                      objectFit: 'contain',
                      imageRendering: 'pixelated'
                    }}
                  />
                ))}
              </div>
              {/* 3块 */}
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src="/assets/wood.PNG"
                    alt="木块"
                    className="pixel-image"
                    style={{
                      width: '64px',
                      height: 'auto',
                      objectFit: 'contain',
                      imageRendering: 'pixelated'
                    }}
                  />
                ))}
              </div>
              {/* 4块 */}
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src="/assets/wood.PNG"
                    alt="木块"
                    className="pixel-image"
                    style={{
                      width: '64px',
                      height: 'auto',
                      objectFit: 'contain',
                      imageRendering: 'pixelated'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 下部分：输入区域 */}
          <div className="relative w-2/3 mx-auto flex flex-col">
            {/* 输入框（使用原来的 CSS 样式） */}
            <div 
              className="pixel-font rounded-lg p-6"
              style={{ 
                backgroundColor: '#faf5ed',
                border: '4px solid #8b6f47',
                borderRadius: '12px'
              }}
            >
              <HomeCreateStarter />
            </div>
          </div>
        </main>
        <DebugSupabase />
      </div>
    </AuthGuard>
  );
}
