import React, { useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import { KdtLogo } from './KdtLogo';
import { Phone, MessageCircle, Menu, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  onOpenQuote: () => void;
  onOpenLeadsManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuote, onOpenLeadsManager }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hotline1 = siteConfig.contact.hotlines[0] || { display: "0918 064 164", raw: "0918064164", label: "Ms. Ngọc", zalo: "https://zalo.me/0918064164" };
  const hotline2 = siteConfig.contact.hotlines[1] || { display: "0903 667 355", raw: "0903667355", label: "Mr. Dũng", zalo: "https://zalo.me/0903667355" };

  return (
    <div className="sticky top-0 z-40">
      {/* 1. Dải Top Bar: Nền TRẮNG, chữ MÀU CAM, hiển thị trực tiếp 2 số hotline trên 1 dòng duy nhất */}
      <div className="bg-white text-orange-600 text-xs sm:text-sm py-2 px-4 border-b border-orange-100 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
          {/* Tiêu đề Hotline (ẩn trên mobile siêu nhỏ để chống nhảy dòng) */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
            <span className="font-semibold text-neutral-800 text-xs sm:text-sm whitespace-nowrap">
              Hotline Báo Giá Công Trình:
            </span>
          </div>

          {/* 2 số hotline: Nền trắng, Chữ cam nổi bật, trực tiếp trên 1 dòng, không bao giờ nhảy dòng */}
          <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end gap-3 sm:gap-6 font-bold whitespace-nowrap shrink-0">
            {/* Số 1: Ms. Ngọc */}
            <a 
              href={`tel:${hotline1.raw}`}
              className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 active:text-orange-800 transition-colors py-0.5 group"
              title={`Gọi Ms. Ngọc: ${hotline1.display}`}
            >
              <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-neutral-700 font-semibold text-xs sm:text-sm">{hotline1.label}:</span>
              <span className="font-extrabold text-orange-600 text-xs sm:text-sm tracking-tight underline underline-offset-2">
                {hotline1.display}
              </span>
            </a>

            <span className="text-orange-200">|</span>

            {/* Số 2: Mr. Dũng */}
            <a 
              href={`tel:${hotline2.raw}`}
              className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 active:text-orange-800 transition-colors py-0.5 group"
              title={`Gọi Mr. Dũng: ${hotline2.display}`}
            >
              <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-neutral-700 font-semibold text-xs sm:text-sm">{hotline2.label}:</span>
              <span className="font-extrabold text-orange-600 text-xs sm:text-sm tracking-tight underline underline-offset-2">
                {hotline2.display}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Zone 1: Logo chuẩn KDT + Tên thương hiệu màu cam to nổi bật */}
            <a 
              href="#" 
              className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
              title="Điện Máy KDT-89"
            >
              <KdtLogo className="w-9 h-9 sm:w-11 sm:h-11 group-hover:scale-105 transition-transform" />
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-orange-600 group-hover:text-orange-700 transition-colors drop-shadow-xs">
                {siteConfig.brand.name}
              </span>
            </a>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-neutral-700">
              <a href="#form-bao-gia" className="hover:text-orange-600 transition-colors font-semibold text-orange-600">
                Nhận Báo Giá
              </a>
              <a href="#du-toan" className="hover:text-orange-600 transition-colors">
                Tính Dự Toán
              </a>
              <a href="#danh-muc" className="hover:text-orange-600 transition-colors">
                Danh Mục Thiết Bị
              </a>
              <a href="#mo-hinh" className="hover:text-orange-600 transition-colors">
                Mô Hình Công Trình
              </a>
              <a href="#kho-thuc-te" className="hover:text-orange-600 transition-colors">
                Kho &amp; Thực Tế
              </a>
            </nav>

            {/* Zone 3: Nút CTA & Mobile Menu (Đã bỏ 2 ô vuông gây chật chội và nhảy dòng) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Nút Nhận Báo Giá */}
              <button
                onClick={onOpenQuote}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Nhận Báo Giá</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none"
                aria-label="Mở menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
            <div className="flex flex-col space-y-2 text-sm font-medium text-neutral-800">
              <a
                href="#form-bao-gia"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md bg-amber-50 text-amber-800 font-bold"
              >
                Đăng Ký Nhận Báo Giá
              </a>
              <a
                href="#du-toan"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-neutral-100"
              >
                Tính Dự Toán Nhanh Theo Phòng
              </a>
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Zalo</span>
                    </a>
                  )}
                </div>
              </div>

              {onOpenLeadsManager && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLeadsManager();
                  }}
                  className="w-full py-2 px-3 text-xs text-neutral-500 hover:text-neutral-800 text-center border-t border-neutral-100 pt-2 cursor-pointer"
                >
                  ⚙️ Hộp thư Lead &amp; Quản lý Google Sheets
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
