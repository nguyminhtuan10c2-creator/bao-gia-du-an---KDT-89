import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { Send, CheckCircle, FileSpreadsheet, Truck } from 'lucide-react';

export const StepsSection: React.FC = () => {
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Send className="w-5 h-5 text-amber-600" />;
      case 1:
        return <CheckCircle className="w-5 h-5 text-amber-600" />;
      case 2:
        return <FileSpreadsheet className="w-5 h-5 text-amber-600" />;
      case 3:
        return <Truck className="w-5 h-5 text-amber-600" />;
      default:
        return <Send className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <section id="quy-trinh" className="py-16 sm:py-24 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <span>Quy Trình Làm Việc KDT-89</span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-600 font-normal normal-case">Nhanh chóng & Rõ ràng</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mt-2">
            4 bước tinh gọn từ lúc gửi nhu cầu đến bàn giao công trình
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 leading-relaxed">
            Chúng tôi hiểu tiến độ thi công công trình rất gấp gáp. KDT-89 cam kết phản hồi báo giá trong 30-60 phút và sắp xếp xe giao hàng theo tiến độ hoàn thiện từng phòng.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {siteConfig.steps.map((item, index) => (
            <div
              key={item.step}
              className="relative p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                    {getStepIcon(index)}
                  </div>
                  {/* Clean natural editorial numbering */}
                  <span className="text-2xl font-black text-neutral-300 font-mono">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {index < 3 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-neutral-300">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Fast Track Notice */}
        <div className="mt-10 p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-neutral-700">
            <span className="font-semibold text-neutral-900">Cần báo giá khẩn cấp trong ngày?</span>
            <span className="hidden sm:inline text-neutral-400">|</span>
            <span>Chụp gửi danh sách thiết bị hoặc mặt bằng trực tiếp qua Zalo</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={siteConfig.contact.primaryZaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-700 hover:text-blue-800 underline underline-offset-2"
            >
              Zalo: {siteConfig.contact.hotlines[0].display}
            </a>
            <span className="text-neutral-400">hoặc</span>
            <a
              href={`tel:${siteConfig.contact.primaryPhone}`}
              className="font-bold text-amber-700 hover:text-amber-800"
            >
              Gọi hotline ngay
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
