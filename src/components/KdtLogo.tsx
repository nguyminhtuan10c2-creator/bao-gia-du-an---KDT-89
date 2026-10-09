import React, { useState, useEffect } from 'react';
import { siteConfig } from '../config/siteConfig';

interface KdtLogoProps {
  className?: string;
  size?: number;
}

export const KdtLogo: React.FC<KdtLogoProps> = ({ className = "w-10 h-10", size }) => {
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kdt_custom_logo') || siteConfig.brand.logoUrl || null;
    }
    return siteConfig.brand.logoUrl || null;
  });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem('kdt_custom_logo');
      if (stored) {
        setCustomLogo(stored);
        setImgError(false);
      } else {
        setCustomLogo(siteConfig.brand.logoUrl || null);
        setImgError(false);
      }
    };

    window.addEventListener('kdt_logo_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('kdt_logo_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const style = size ? { width: size, height: size } : undefined;

  // Nếu có logo tùy chỉnh và chưa bị lỗi tải ảnh, hiển thị trực tiếp ảnh logo thực tế
  if (customLogo && !imgError) {
    return (
      <img
        src={customLogo}
        alt="Logo Công ty KDT-89"
        style={style}
        className={`object-contain shrink-0 ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback: Logo vector SVG KDT cách điệu
  return (
    <svg 
      viewBox="0 0 500 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      style={style}
      aria-label="Logo Công ty KDT"
    >
      {/* 3 vòng cung quỹ đạo xám bạc trên cùng bên phải */}
      <g stroke="#7D8287" strokeLinecap="round" fill="none">
        <path d="M 175 142 C 230 72, 345 48, 415 95 C 460 125, 470 182, 448 222" strokeWidth="22" opacity="0.9" />
        <path d="M 215 138 C 262 88, 345 72, 398 108 C 432 135, 442 176, 422 212" strokeWidth="16" opacity="0.8" />
        <path d="M 255 138 C 288 102, 348 92, 388 118 C 412 138, 420 170, 402 200" strokeWidth="12" opacity="0.7" />

        {/* 3 vòng cung quỹ đạo xám bạc dưới cùng bên trái */}
        <path d="M 325 358 C 270 428, 155 452, 85 405 C 40 375, 30 318, 52 278" strokeWidth="22" opacity="0.9" />
        <path d="M 285 362 C 238 412, 155 428, 102 392 C 68 365, 58 324, 78 288" strokeWidth="16" opacity="0.8" />
        <path d="M 245 362 C 212 398, 152 408, 112 382 C 88 362, 80 330, 98 300" strokeWidth="12" opacity="0.7" />
      </g>

      {/* Chữ KDT đặc trưng khối dày màu cam rực rỡ */}
      <g fill="#F05A22">
        {/* K */}
        <path d="M 40 185 C 40 166, 62 156, 92 156 L 134 156 L 134 238 L 202 158 L 260 158 L 182 242 L 262 352 L 198 352 L 134 262 L 134 352 L 68 352 C 48 352, 40 338, 40 320 Z" />
        
        {/* D */}
        <path d="M 184 204 C 184 176, 204 156, 238 156 L 332 156 C 378 156, 410 192, 410 254 C 410 316, 378 352, 332 352 L 184 352 Z M 248 218 L 248 294 L 312 294 C 338 294, 352 278, 352 254 C 352 230, 338 218, 312 218 Z" />

        {/* T */}
        <path d="M 322 186 L 322 156 L 472 156 L 454 198 L 418 198 L 418 352 L 356 352 L 356 198 L 322 198 Z" />
      </g>
    </svg>
  );
};
