"use client";

import { useState } from "react";

export default function CowboyCharacter() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative">
      {!imageError ? (
        <img 
          src="/assets/cowboy.png" 
          alt="牛仔角色" 
          className="pixel-font"
          style={{ 
            imageRendering: 'pixelated',
            imageRendering: '-moz-crisp-edges',
            imageRendering: 'crisp-edges',
            width: '64px',
            height: '64px',
            objectFit: 'contain',
            display: 'block'
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="pixel-font text-6xl">🤠</div>
      )}
    </div>
  );
}

