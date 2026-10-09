import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { Building2, Home, Hotel, Construction, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ProjectTypesSectionProps {
  onSelectProjectForQuote: (projectTitle: string) => void;
}

export const ProjectTypesSection: React.FC<ProjectTypesSectionProps> = ({ onSelectProjectForQuote }) => {
  const getProjectIcon = (id: string) => {
    switch (id) {
      case 'nha-tro':
        return <Building2 className="w-5 h-5 text-amber-600" />;
      case 'chdv':
        return <Home className="w-5 h-5 text-sky-600" />;
      case 'khach-san-nho':
        return <Hotel className="w-5 h-5 text-indigo-600" />;
      case 'dan-dung':
        return <Construction className="w-5 h-5 text-emerald-600" />;
      default:
        return <Building2 className="w-5 h-5 text-neutral-600" />;
    }
  };

  return (
    <section id="mo-hinh" className="py-16 sm:py-24 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <span>Giải Pháp Cho Từng Mô Hình</span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-600 font-normal normal-case">Tư vấn đúng bài toán đầu tư</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mt-2">
            Phương án thiết bị theo từng loại hình công trình
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 leading-relaxed">
            Mỗi mô hình lưu trú và công trình có bài toán chi phí, độ bền và tiêu thụ điện khác nhau. KDT-89 đề xuất cấu hình phù hợp để chủ đầu tư tối ưu ngân sách mà vẫn vận hành ổn định.
          </p>
        </div>

        {/* 4 Project Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {siteConfig.projectTypes.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 hover:shadow-sm transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      {getProjectIcon(project.id)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">
                        {project.title}
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium">
                        Dành cho: {project.audience}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content description */}
                <p className="text-sm text-neutral-700 mt-4 leading-relaxed">
                  {project.content}
                </p>

                {/* Key Criteria */}
                {project.keyCriteria && (
                  <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                      Tiêu chí ưu tiên:
                    </div>
                    <div className="text-xs text-neutral-800 font-medium">
                      {project.keyCriteria}
                    </div>
                  </div>
                )}

                {/* Recommended bundle */}
                {project.recommendedMix && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-neutral-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-neutral-800">Cấu hình gợi ý:</strong> {project.recommendedMix}</span>
                  </div>
                )}
              </div>

              {/* Action prompt */}
              <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-neutral-500 italic">
                  {project.actionPrompt}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectProjectForQuote(project.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Báo giá mô hình này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
