import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { Wind, Flame, Waves, Refrigerator, Tv, UtensilsCrossed, ArrowRight } from 'lucide-react';

interface CategoriesSectionProps {
  onSelectCategoryForQuote: (categoryName: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onSelectCategoryForQuote }) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'may-lanh':
        return <Wind className="w-5 h-5 text-sky-600" />;
      case 'may-tam-nong':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'may-giat':
        return <Waves className="w-5 h-5 text-blue-600" />;
      case 'tu-lanh':
        return <Refrigerator className="w-5 h-5 text-emerald-600" />;
      case 'tivi':
        return <Tv className="w-5 h-5 text-indigo-600" />;
      case 'gia-dung-khac':
        return <UtensilsCrossed className="w-5 h-5 text-orange-600" />;
      default:
        return <Wind className="w-5 h-5 text-neutral-600" />;
    }
  };

  return (
    <section id="danh-muc" className="py-16 sm:py-24 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <span>Danh Mục Hàng Công Trình</span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-600 font-normal normal-case">Thiết bị điện máy đồng bộ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mt-2">
              Các nhóm thiết bị chủ lực do KDT-89 cung cấp
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2 leading-relaxed">
              KDT-89 phân phối trực tiếp từ nhà máy các thương hiệu uy tín, đảm bảo tiêu chuẩn vận hành công trình, bảo hành chính hãng và giá chiết khấu cạnh tranh.
            </p>
          </div>

          <div className="shrink-0">
            <span className="text-xs text-neutral-500 block">Tư vấn trực tiếp:</span>
            <a
              href={`tel:${siteConfig.contact.primaryPhone}`}
              className="text-base font-bold text-neutral-900 hover:text-amber-600 transition-colors"
            >
              {siteConfig.contact.hotlines[0].display}
            </a>
          </div>
        </div>

        {/* 6 Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {siteConfig.categories.map((cat, index) => {
            const isMarquee = index === 0; // Máy lạnh is marquee category
            return (
              <div
                key={cat.id}
                className={`flex flex-col justify-between rounded-xl border p-6 transition-all duration-200 hover:shadow-md ${
                  isMarquee
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div>
                  {/* Category Header with Unboxed Metadata */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      {getCategoryIcon(cat.id)}
                    </div>
                    {/* Unboxed clean text metadata */}
                    <div className="text-xs font-medium text-neutral-500">
                      {cat.tag} · {cat.badgeCount}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                    {cat.name}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                    {cat.shortDesc}
                  </p>

                  {/* Brands Hint */}
                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Thương hiệu tiêu biểu:
                    </div>
                    <div className="text-xs font-medium text-neutral-800 mt-1">
                      {cat.brandsHint}
                    </div>
                  </div>

                  {/* Featured Specs */}
                  {cat.featuredSpecs && (
                    <ul className="mt-3 space-y-1.5 text-xs text-neutral-600">
                      {cat.featuredSpecs.map((spec, sIdx) => (
                        <li key={sIdx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-amber-600 shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onSelectCategoryForQuote(cat.name)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    <span>Yêu cầu báo giá nhóm này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-neutral-400">VAT & Giao tận nơi</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
