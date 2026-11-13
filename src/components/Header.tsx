import React, { useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import { KdtLogo } from './KdtLogo';
import { Phone, MessageCircle, Menu, X, ArrowUpRight } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface HotlineItem {
  display: string;
  raw: string;
  label: string;
  zalo?: string;
}

interface HeaderProps {
  isAdmin?: boolean;
  brandName?: string;
  ctaText?: string;
  hotline1?: HotlineItem;
  hotline2?: HotlineItem;
  onOpenQuote: () => void;
  onOpenRoomVisualizer?: () => void;
  onOpenLeadsManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin = false,
  brandName,
  ctaText,
  hotline1: customHotline1,
  hotline2: customHotline2,
  onOpenQuote,
  onOpenRoomVisualizer,
  onOpenLeadsManager,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const defaultH1 = siteConfig.contact.hotlines[0] || { display: "0918 064 167", raw: "0918064167", label: "Ms. Ngọc", zalo: "https://zalo.me/0918064167" };
  const defaultH2 = siteConfig.contact.hotlines[1] || { display: "0903 667 355", raw: "0903667355", label: "Mr. Dũng", zalo: "https://zalo.me/0903667355" };
  const hotline1 = customHotline1?.display ? { ...defaultH1, ...customHotline1, zalo: `https://zalo.me/${customHotline1.raw || defaultH1.raw}` } : defaultH1;
  const hotline2 = customHotline2?.display ? { ...defaultH2, ...customHotline2, zalo: `https://zalo.me/${customHotline2.raw || defaultH2.raw}` } : defaultH2;

  return (
    <div className="sticky top-0 z-40 w-full">
      {/* 1. Dải Top Bar: Mobile hiển thị 1 nút gọi hotline chính to dễ bấm; Desktop hiển thị cả 2 số */}
      <div className="bg-white text-orange-600 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-6 lg:px-8 border-b border-orange-100 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Tiêu đề Hotline */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
            <span className="font-semibold text-neutral-800 text-xs sm:text-sm whitespace-nowrap">
              Hotline Báo Giá:
            </span>
          </div>

          {/* Mobile (< sm): 1 nút gọi chính to, dễ bấm (số thứ 2 nằm trong menu, form và footer) */}
          <div className="flex sm:hidden items-center shrink-0">
            <a
              href={`tel:${hotline1.raw}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-xs tracking-tight shadow-xs whitespace-nowrap"
              title={`Gọi ${hotline1.label}: ${hotline1.display}`}
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{hotline1.label}: {hotline1.display}</span>
            </a>
          </div>

          {/* Desktop (>= sm): 2 số hotline rõ ràng */}
          <div className="hidden sm:flex items-center gap-5 font-bold shrink-0">
            <a 
              href={`tel:${hotline1.raw}`}
              className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 active:text-orange-800 transition-colors group text-sm whitespace-nowrap"
              title={`Gọi ${hotline1.label}: ${hotline1.display}`}
            >
              <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-neutral-700 font-semibold">{hotline1.label}:</span>
              <span className="font-extrabold text-orange-600 tracking-tight underline underline-offset-2">
                {hotline1.display}
              </span>
            </a>

            <span className="text-orange-300 text-xs">|</span>

            <a 
              href={`tel:${hotline2.raw}`}
              className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 active:text-orange-800 transition-colors group text-sm whitespace-nowrap"
              title={`Gọi ${hotline2.label}: ${hotline2.display}`}
            >
              <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-neutral-700 font-semibold">{hotline2.label}:</span>
              <span className="font-extrabold text-orange-600 tracking-tight underline underline-offset-2">
                {hotline2.display}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-neutral-200 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18 gap-2 sm:gap-3 lg:gap-4">
            
            {/* Zone 1: Logo & Brand Name */}
            <a 
              href="#" 
              className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0 min-w-0"
              title="Điện Máy KDT-89"
            >
              <KdtLogo className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 group-hover:scale-105 transition-transform shrink-0" />
              <span className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-orange-600 group-hover:text-orange-700 transition-colors whitespace-nowrap">
                {brandName || siteConfig.brand.name}
              </span>
            </a>

            {/* Zone 2: Navigation Links (compact spacing so CTA never clips at 1280px/1440px) */}
            <nav className="hidden lg:flex items-center justify-center gap-3.5 xl:gap-5 text-[13px] font-semibold text-neutral-700 min-w-0">
              <a
                href="#form-bao-gia"
                onClick={() => trackEvent('click_quote_cta', { location: 'header_nav' })}
                className="hover:text-orange-600 transition-colors whitespace-nowrap"
              >
                Nhận báo giá
              </a>
              <a
                href="#du-toan"
                onClick={() => trackEvent('open_estimator', { location: 'header_nav' })}
                className="hover:text-orange-600 transition-colors whitespace-nowrap"
              >
                Tính dự toán
              </a>
              <button
                type="button"
                onClick={() => {
                  trackEvent('open_estimator', { location: 'header_room_models' });
                  if (onOpenRoomVisualizer) onOpenRoomVisualizer();
                }}
                className="hover:text-orange-600 transition-colors font-bold text-orange-600 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span>Cấu hình mẫu</span>
              </button>
              <a href="#danh-muc" className="hover:text-orange-600 transition-colors whitespace-nowrap">
                Thiết bị
              </a>
              <a href="#mo-hinh" className="hover:text-orange-600 transition-colors whitespace-nowrap">
                Mô hình
              </a>
              <a href="#kho-thuc-te" className="hover:text-orange-600 transition-colors whitespace-nowrap">
                Kho thực tế
              </a>
            </nav>

            {/* Zone 3: Nút CTA & Mobile Menu (chừa đủ khoảng trống bên phải ở mọi độ phân giải) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 pr-0.5">
              <button
                type="button"
                onClick={() => {
                  trackEvent('click_quote_cta', { location: 'header_cta' });
                  onOpenQuote();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>{ctaText || 'Nhận Báo Giá'}</span>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              </button>

              {/* Mobile / Tablet menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none cursor-pointer"
                aria-label="Mở menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
            <div className="flex flex-col space-y-2 text-sm font-medium text-neutral-800">
              <a
                href="#form-bao-gia"
                onClick={() => {
                  trackEvent('click_quote_cta', { location: 'mobile_drawer' });
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-md bg-amber-50 text-amber-800 font-bold"
              >
                Đăng Ký Nhận Báo Giá
              </a>
              <a
                href="#du-toan"
                onClick={() => {
                  trackEvent('open_estimator', { location: 'mobile_drawer' });
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-md hover:bg-neutral-100"
              >
                Tính Dự Toán Nhanh Theo Phòng
              </a>
              <button
                type="button"
                onClick={() => {
                  trackEvent('open_estimator', { location: 'mobile_drawer_room_models' });
                  setMobileMenuOpen(false);
                  if (onOpenRoomVisualizer) onOpenRoomVisualizer();
                }}
                className="w-full text-left px-3 py-2 rounded-md bg-orange-50 text-orange-700 font-bold flex items-center justify-between cursor-pointer"
              >
                <span>Chọn Cấu Hình Mẫu Theo Diện Tích</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-600 text-white font-bold">Mở</span>
              </button>
              <a
                href="#danh-muc"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-neutral-100"
              >
                Danh Mục Thiết Bị
              </a>
              <a
                href="#mo-hinh"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-neutral-100"
              >
                Mô Hình Công Trình
              </a>
              <a
                href="#kho-thuc-te"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-neutral-100"
              >
                Hình Ảnh Kho Bãi &amp; Giao Hàng
              </a>
            </div>

            {/* Trực tiếp 2 hotline trong mobile menu */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-1">
                Hotline Tư Vấn Công Trình:
              </div>

              {/* Hotline 1 */}
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-[11px] text-neutral-500 block">{hotline1.label}</span>
                  <span className="font-extrabold text-sm text-neutral-900 block">{hotline1.display}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${hotline1.raw}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi</span>
                  </a>
                  {hotline1.zalo && (
                    <a
                      href={hotline1.zalo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('click_zalo', { location: 'header_drawer_primary' })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Zalo</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Hotline 2 */}
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-[11px] text-neutral-500 block">{hotline2.label}</span>
                  <span className="font-extrabold text-sm text-neutral-900 block">{hotline2.display}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${hotline2.raw}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi</span>
                  </a>
                  {hotline2.zalo && (
                    <a
                      href={hotline2.zalo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('click_zalo', { location: 'header_drawer_secondary' })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Zalo</span>
                    </a>
                  )}
                </div>
              </div>

              {isAdmin && onOpenLeadsManager && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLeadsManager();
                  }}
                  className="w-full py-2 px-3 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-center font-medium border border-amber-200 mt-2 cursor-pointer"
                >
                  ⚙️ Hộp thư Lead &amp; Quản lý Google Sheets (Admin)
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
