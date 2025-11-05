"use client";

import { useState } from "react";

export default function CowboyCharacter() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative">
      {/* 牛仔角色 */}
      {!imageError ? (
        <img 
          src="/assets/cowboy_bor.png" 
          alt="牛仔角色" 
          className="pixel-image"
          style={{ 
            width: 'auto',
            height: 'auto',
            maxWidth: '120px',
            objectFit: 'contain',
            display: 'block',
            imageRendering: 'pixelated'
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="pixel-font text-6xl">🤠</div>
      )}
      
      {/* 对话框（使用原来的 wooden-dialog 样式） */}
      <div 
        className="pixel-font wooden-dialog absolute -top-16 left-8 w-48 px-4 py-3 text-sm"
        style={{ 
          color: '#4a4a4a'
        }}
      >
        <div>嘿! 没想好做什么?</div>
        <div>不如试试......</div>
      </div>
    </div>
  );
}

