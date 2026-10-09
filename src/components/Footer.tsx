import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { KdtLogo } from './KdtLogo';
import { Phone, MapPin, Clock, MessageCircle, ShieldCheck } from 'lucide-react';

interface FooterProps {
  isAdmin?: boolean;
  onOpenLeadsManager?: () => void;
  onOpenAdminMedia?: () => void;
  onToggleAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  isAdmin = false, 
  onOpenLeadsManager, 
  onOpenAdminMedia,
  onToggleAdmin 
}) => {
  const [clickCount, setClickCount] = React.useState(0);

  const handleCopyrightClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      setClickCount(0);
      if (onToggleAdmin) {
        onToggleAdmin();
      }
    }
    // Tự động reset sau 2 giây nếu không bấm tiếp
    setTimeout(() => setClickCount(0), 2000);
  };
  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <KdtLogo className="w-10 h-10 shrink-0" />
              <div>
                <span className="text-2xl font-black tracking-tight text-orange-500 block">
                  {siteConfig.brand.name}
                </span>
                <span className="text-xs text-neutral-400 font-medium mt-0.5 block">
                  {siteConfig.brand.legalName}
                </span>
              </div>
            </div>

            <p className="text-neutral-400 leading-relaxed max-w-sm">
              {siteConfig.brand.tagline}. Kênh phân phối, tư vấn và báo giá thiết bị điện máy chính hãng cho các công trình nhà trọ, căn hộ dịch vụ (CHDV), khách sạn và dân dụng tại TP.HCM và các tỉnh lân cận.
            </p>

            <div className="flex items-center gap-2 text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Hàng chính hãng 100% · Đầy đủ hóa đơn GTGT (VAT)</span>
            </div>
          </div>

          {/* Contact Details (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Thông Tin Liên Hệ & Kho Bãi
            </h4>

            <div className="space-y-2.5 text-neutral-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {siteConfig.contact.address}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {siteConfig.contact.workingHours}
                </span>
              </div>

              <div className="flex flex-col gap-1 pt-1">
                {siteConfig.contact.hotlines.map((hotline, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-neutral-400">{hotline.label}:</span>
                    <a
                      href={`tel:${hotline.raw}`}
                      className="font-bold text-white hover:text-amber-400 transition-colors"
                    >
                      {hotline.display}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links & Categories (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Nhóm Hàng Chủ Lực
            </h4>

            <ul className="space-y-2 text-neutral-300">
              <li>
                <a href="#danh-muc" className="hover:text-amber-400 transition-colors">
                  Máy lạnh Inverter công trình
                </a>
              </li>
              <li>
                <a href="#danh-muc" className="hover:text-amber-400 transition-colors">
                  Máy tắm nóng trực tiếp / gián tiếp
                </a>
              </li>
              <li>
                <a href="#danh-muc" className="hover:text-amber-400 transition-colors">
                  Máy giặt căn hộ & giặt sấy chung
                </a>
              </li>
              <li>
                <a href="#danh-muc" className="hover:text-amber-400 transition-colors">
                  Tủ lạnh mini & tủ lạnh 2 cánh
                </a>
              </li>
              <li>
                <a href="#danh-muc" className="hover:text-amber-400 transition-colors">
                  Smart TV & Thiết bị gia dụng bếp
                </a>
              </li>
              <li>
                <a href="#du-toan" className="text-amber-400 hover:underline">
                  Công cụ tính dự toán theo phòng &rarr;
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div 
            onClick={handleCopyrightClick} 
            className="select-none cursor-default hover:text-neutral-400 transition-colors"
            title="KDT-89 Official"
          >
            © {new Date().getFullYear()} {siteConfig.brand.legalName}. Tất cả các quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <a href="#form-bao-gia" className="hover:text-neutral-300 transition-colors">
              Đăng ký báo giá
            </a>
            <span>·</span>
            <a href={siteConfig.contact.primaryZaloUrl} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300 transition-colors">
              Zalo {siteConfig.contact.hotlines[0].display}
            </a>
            <span>·</span>
            <span>Kho TP. Hồ Chí Minh</span>
          </div>
        </div>

        {/* Dedicated Admin Bar - CHỈ HIỂN THỊ KHI CHỦ WEB ĐĂNG NHẬP / BẬT CHẾ ĐỘ ADMIN (?admin) */}
        {isAdmin && (
          <div className="mt-4 p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span>🔐</span>
              <span>Chế độ Quản trị viên (Chỉ bạn thấy khi vào link ?admin):</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {onOpenLeadsManager && (
                <button
                  type="button"
                  onClick={onOpenLeadsManager}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-medium transition-colors cursor-pointer"
                >
                  ⚙️ Quản lý Lead &amp; Sheets
                </button>
              )}
              {onOpenAdminMedia && (
                <button
                  type="button"
                  onClick={onOpenAdminMedia}
                  className="px-2.5 py-1 rounded bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 font-medium transition-colors cursor-pointer"
                >
                  🖼️ Quản trị Logo &amp; Ảnh
                </button>
              )}
              {onToggleAdmin && (
                <button
                  type="button"
                  onClick={onToggleAdmin}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors cursor-pointer"
                  title="Ẩn chế độ quản trị để xem web như khách bình thường"
                >
                  ✕ Ẩn quản trị
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </footer>
  );
};
