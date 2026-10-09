import React, { useState, useEffect } from 'react';
import { siteConfig } from '../config/siteConfig';
import { KdtLogo } from './KdtLogo';
import { FileText, ArrowRight, ShieldCheck, Truck, Clock, Layers } from 'lucide-react';

interface HeroProps {
  onOpenQuote: () => void;
  onOpenEstimator: () => void;
}

const HERO_IMAGE_STORAGE_KEY = 'kdt89_custom_hero_image';

export const Hero: React.FC<HeroProps> = ({ onOpenQuote, onOpenEstimator }) => {
  const [heroImgSrc, setHeroImgSrc] = useState<string>(siteConfig.galleryAssets.hero);

  // Khôi phục ảnh đã đổi từ localStorage nếu có & lắng nghe cập nhật từ Quản trị
  useEffect(() => {
    const checkImage = () => {
      try {
        const savedImg = localStorage.getItem(HERO_IMAGE_STORAGE_KEY);
        if (savedImg) {
          setHeroImgSrc(savedImg);
        } else {
          setHeroImgSrc(siteConfig.galleryAssets.hero);
        }
      } catch {
        // Ignore localStorage errors
      }
    };

    checkImage();
    window.addEventListener('kdt_hero_updated', checkImage);
    window.addEventListener('storage', checkImage);
    return () => {
      window.removeEventListener('kdt_hero_updated', checkImage);
      window.removeEventListener('storage', checkImage);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-white text-neutral-900 pt-8 pb-14 lg:pt-14 lg:pb-20 border-b border-neutral-200">
      {/* Background ambient lighting - tông trắng thanh lịch */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fed7aa_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Proposition and Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Clean unboxed kicker / badge (Logo KDT + chữ nhỏ màu đen) */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-900">
              <KdtLogo className="w-5 h-5 shrink-0" />
              <span>{siteConfig.hero.badge}</span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-700 font-medium normal-case">Kho hàng TP. Hồ Chí Minh</span>
            </div>

            {/* Headline: CHỮ SIZE LỚN MÀU CAM */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-orange-600 leading-[1.18] text-balance">
              {siteConfig.hero.headline}
            </h1>

            {/* Description: CHỮ NHỎ MÀU ĐEN */}
            <p className="text-base sm:text-lg text-neutral-800 max-w-2xl leading-relaxed font-normal">
              {siteConfig.hero.description} Cung cấp trọn gói máy lạnh Inverter, máy tắm nóng, máy giặt, tủ lạnh, tivi với chiết khấu đại lý tốt nhất.
            </p>

            {/* Primary Action Buttons: Nút Nhận Báo Giá NỀN CAM - CHỮ TRẮNG */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onOpenQuote}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-extrabold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl shadow-md hover:shadow-orange-600/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>{siteConfig.hero.ctaQuoteText}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={onOpenEstimator}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 text-xs font-bold text-neutral-900 hover:text-black bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl transition-colors whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                <span>Tính dự toán theo số phòng</span>
              </button>
            </div>

            {/* Trust Markers: CHỮ NHỎ MÀU ĐEN */}
            <div className="pt-5 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-neutral-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>100% Chính Hãng (VAT)</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Giao Theo Đợt Công Trình</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Báo Giá Nhanh Trong 30 Phút</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Đồng Bộ Thiết Bị Các Hãng</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Anchor (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-xl bg-neutral-100 group">
              <img
                src={heroImgSrc}
                alt="Kho hàng điện máy công trình KDT-89"
                referrerPolicy="no-referrer"
                className="w-full h-72 sm:h-96 object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

              {/* Overlay card thông tin kho KDT-89 */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-orange-600 tracking-wide uppercase">
                      Kho Hàng &amp; Giao Nhận KDT-89
                    </p>
                    <p className="text-xs text-neutral-800 font-medium mt-1 line-clamp-2">
                      {siteConfig.contact.address}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded shrink-0">
                    Sẵn Kho
                  </span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-700 font-medium">Hỗ trợ kỹ thuật: 08:00 - 18:00</span>
                  <a 
                    href="#kho-thuc-te" 
                    className="text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1"
                  >
                    Xem tất cả ảnh kho &rarr;
                  </a>
                </div>
              </div>
            </div>

            {/* Chú thích thông tin ảnh kho */}
            <p className="text-[11px] text-neutral-500 text-center mt-2.5 flex items-center justify-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
              <span>Hình ảnh kho vận &amp; phân phối thiết bị chính hãng KDT-89 tại TP.HCM</span>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
