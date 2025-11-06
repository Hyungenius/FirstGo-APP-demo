"use client";

/**
 * 教程页骨架屏组件
 * 用于在加载教程数据时显示，提升用户体验
 */
export default function TutorialSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-3xl p-6 pixel-font" style={{ minHeight: '100vh', backgroundColor: '#f5f0e8' }}>
      <div className="relative z-10">
        {/* 返回按钮骨架 */}
        <div className="mb-4">
          <div 
            className="inline-block h-8 w-24 animate-pulse rounded"
            style={{ 
              backgroundColor: '#e8ddd0',
              borderRadius: '6px'
            }}
          />
        </div>

        {/* 标题骨架 */}
        <div className="mb-6 pixel-wooden-container p-4">
          <div 
            className="mx-auto h-7 w-48 animate-pulse rounded"
            style={{ 
              backgroundColor: '#e8ddd0',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* 进度条骨架 */}
        <div className="mb-6">
          <div className="mb-1 flex items-center justify-between">
            <div 
              className="h-4 w-12 animate-pulse rounded"
              style={{ 
                backgroundColor: '#e8ddd0',
                borderRadius: '4px'
              }}
            />
            <div 
              className="h-4 w-16 animate-pulse rounded"
              style={{ 
                backgroundColor: '#e8ddd0',
                borderRadius: '4px'
              }}
            />
          </div>
          <div className="h-3 w-full overflow-hidden pixel-wooden-card" style={{ padding: '2px' }}>
            <div 
              className="h-full w-3/4 animate-pulse"
              style={{ 
                backgroundColor: '#e8ddd0',
                borderRadius: '2px'
              }}
            />
          </div>
        </div>

        {/* 准备物品卡片骨架 */}
        <div className="mb-6 pixel-wooden-card p-4">
          <div className="flex">
            <div className="w-20 flex items-center justify-center">
              <div 
                className="h-16 w-16 animate-pulse rounded"
                style={{ 
                  backgroundColor: '#e8ddd0',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div className="flex-1 pl-4">
              <div className="mb-3 flex items-center justify-between">
                <div 
                  className="h-5 w-24 animate-pulse rounded"
                  style={{ 
                    backgroundColor: '#e8ddd0',
                    borderRadius: '4px'
                  }}
                />
                <div 
                  className="h-6 w-12 animate-pulse rounded"
                  style={{ 
                    backgroundColor: '#e8ddd0',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div className="space-y-1">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className="h-4 animate-pulse rounded"
                    style={{ 
                      backgroundColor: '#e8ddd0',
                      borderRadius: '4px',
                      width: `${60 + i * 10}%`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 步骤列表骨架 */}
        <div className="mb-6 space-y-3">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="space-y-2">
              <div className="pixel-wooden-card overflow-hidden" style={{ borderRadius: '6px' }}>
                <div className="relative z-10 p-4" style={{ backgroundColor: '#faf5ed' }}>
                  <div 
                    className="mb-2 h-6 animate-pulse rounded"
                    style={{ 
                      backgroundColor: '#e8ddd0',
                      borderRadius: '4px',
                      width: step % 2 === 0 ? '70%' : '85%'
                    }}
                  />
                  {step <= 2 && (
                    <div 
                      className="h-4 animate-pulse rounded"
                      style={{ 
                        backgroundColor: '#e8ddd0',
                        borderRadius: '4px',
                        width: '60%',
                        marginTop: '8px'
                      }}
                    />
                  )}
                  <div 
                    className="mt-2 h-3 w-20 animate-pulse rounded"
                    style={{ 
                      backgroundColor: '#e8ddd0',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 完成按钮骨架 */}
        <div 
          className="h-12 w-full animate-pulse rounded"
          style={{ 
            backgroundColor: '#e8ddd0',
            borderRadius: '6px'
          }}
        />
      </div>
    </div>
  );
}

