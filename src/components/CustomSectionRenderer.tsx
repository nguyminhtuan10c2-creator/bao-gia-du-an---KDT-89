import React from 'react';
import { CustomSectionItem } from '../services/siteContentService';
import { Sparkles, ArrowRight, Trash2, Edit3 } from 'lucide-react';

interface CustomSectionRendererProps {
  section: CustomSectionItem;
  isAdmin?: boolean;
  onEdit?: (section: CustomSectionItem) => void;
  onDelete?: (id: string) => void;
  onOpenQuote?: () => void;
}

export const CustomSectionRenderer: React.FC<CustomSectionRendererProps> = ({
  section,
  isAdmin = false,
  onEdit,
  onDelete,
  onOpenQuote,
}) => {
  if (section.isVisible === false) return null;

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-neutral-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin floating controls */}
        {isAdmin && (
          <div className="mb-4 flex items-center justify-end gap-2 text-xs">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(section)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Sửa phần này</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(section.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa phần này</span>
              </button>
            )}
          </div>
        )}

        <div className="text-center max-w-3xl mx-auto mb-10">
          {section.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>{section.badge}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-3 text-sm sm:text-base text-neutral-600">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Content Body */}
        {section.content && (
          <div className="max-w-4xl mx-auto text-neutral-700 text-sm sm:text-base leading-relaxed whitespace-pre-line text-center bg-neutral-50 rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-2xs">
            {section.content}
          </div>
        )}

        {/* Highlights if provided */}
        {section.highlights && section.highlights.length > 0 && (
          <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50/50 border border-orange-100 text-xs sm:text-sm text-neutral-800">
                <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        {section.ctaText && (
          <div className="mt-8 text-center">
            {section.ctaLink?.startsWith('#') ? (
              <a
                href={section.ctaLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all"
              >
                <span>{section.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : onOpenQuote ? (
              <button
                type="button"
                onClick={onOpenQuote}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <span>{section.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        )}

      </div>
    </section>
  );
};
