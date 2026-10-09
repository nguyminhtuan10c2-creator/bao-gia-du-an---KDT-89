import React from 'react';

interface PlaceholderImageProps {
  label?: string;
  aspect?: string;
  className?: string;
  hint?: string;
  src?: string | null;
  alt?: string;
  onClick?: () => void;
}

export default function PlaceholderImage({
  label = "Hình ảnh thực tế Điện Máy KDT-89",
  aspect = "aspect-video",
  className = "",
  hint = "",
  src = null,
  alt = "KDT-89",
  onClick,
}: PlaceholderImageProps) {
  if (src) {
    return (
      <div 
        onClick={onClick}
        className={`relative overflow-hidden rounded-xl bg-slate-100 ${aspect} ${className}`}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          loading="lazy" 
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 flex flex-col items-center justify-center text-center text-slate-500 shadow-inner group ${aspect} ${className}`}
    >
      <div className="w-12 h-12 mb-2 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.8" 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
      <p className="font-semibold text-xs sm:text-sm text-slate-700 max-w-[90%] leading-snug">{label}</p>
      {hint && <span className="text-[11px] text-slate-400 mt-1">{hint}</span>}
      <span className="mt-2 inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
        Khung ảnh KDT-89
      </span>
    </div>
  );
}
