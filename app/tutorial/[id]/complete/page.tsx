"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CompletePage() {
  const params = useParams();
  const id = params?.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // 确保视频在移动端也能播放
    const video = videoRef.current;
    if (!video) return;

    // 设置视频属性，确保移动端兼容
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true'); // 腾讯 X5 内核
    video.setAttribute('x5-video-player-type', 'h5');
    video.setAttribute('x5-video-player-fullscreen', 'false');

    // 尝试播放视频
    const attemptPlay = () => {
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setShowPlayButton(false);
          })
          .catch((error) => {
            console.log("视频自动播放失败:", error);
            // 在移动端，自动播放可能失败，显示播放按钮
            setShowPlayButton(true);
          });
      }
    };

    // 监听多个事件，确保视频能播放
    const handleCanPlay = () => attemptPlay();
    const handleLoadedData = () => attemptPlay();
    const handleLoadedMetadata = () => attemptPlay();

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // 如果视频已经可以播放，立即尝试播放
    if (video.readyState >= 2) {
      attemptPlay();
    }
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play()
        .then(() => {
          setShowPlayButton(false);
        })
        .catch((error) => {
          console.error("手动播放失败:", error);
        });
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center pixel-font" style={{ backgroundColor: '#f5f0e8' }}>
      {/* 视频播放 */}
      <div className="relative w-full max-w-md pixel-wooden-container p-4">
        {videoError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <p className="pixel-font text-lg" style={{ color: '#6b5335' }}>完成！</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-auto"
              style={{
                objectFit: 'contain',
                imageRendering: 'pixelated',
                borderRadius: '4px',
              }}
              onError={(e) => {
                console.error("视频加载错误:", e);
                const video = e.currentTarget;
                console.error("视频错误详情:", {
                  error: video.error?.code,
                  message: video.error?.message,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  src: video.src
                });
                setVideoError(true);
              }}
            >
              <source src="/assets/done.mov" type="video/quicktime" />
              您的浏览器不支持视频播放。
            </video>
            {showPlayButton && (
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded cursor-pointer transition-opacity hover:bg-opacity-40"
                style={{ borderRadius: '4px' }}
              >
                <div className="pixel-font text-white text-4xl">▶️</div>
              </button>
            )}
          </>
        )}
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


