import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { MessageCircle, FileText } from 'lucide-react';

interface FloatingContactProps {
  onOpenQuote: () => void;
}

export const FloatingContact: React.FC<FloatingContactProps> = ({ onOpenQuote }) => {
  return (
    <>
      {/* Desktop Quick Zalo Trigger (Gọn nhẹ, không có 2 ô vuông số điện thoại) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 items-center">
        <a
          href={siteConfig.contact.primaryZaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all font-bold text-xs group"
          title="Chat Zalo tư vấn công trình"
        >
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Chat Zalo Tư Vấn</span>
        </a>
      </div>

      {/* Mobile Sticky Action Bar: Đã bỏ 2 ô vuông số điện thoại, chỉ giữ nút thao tác nhanh gọn gàng */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-2 shadow-lg flex items-center justify-between gap-3">
        <a
          href={siteConfig.contact.primaryZaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 active:bg-blue-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-blue-600" />
          <span>Chat Zalo</span>
        </a>

        <button
          type="button"
          onClick={onOpenQuote}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-orange-600 active:bg-orange-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Nhận Báo Giá</span>
        </button>
      </div>
    </>
  );
};
