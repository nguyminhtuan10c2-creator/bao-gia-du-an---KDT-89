import React, { useState, useEffect } from 'react';
import { siteConfig } from '../config/siteConfig';
import PlaceholderImage from './PlaceholderImage';
import { MapPin, X, ZoomIn, CheckCircle, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { EditableEvidenceCaption } from '../services/siteContentService';
import { getLocalMediaAssets } from '../services/mediaSyncService';

interface RealEvidenceSectionProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  customCaptions?: Record<string, EditableEvidenceCaption>;
  contactAddress?: string;
  contactWorkingHours?: string;
  isAdmin?: boolean;
  onEditSection?: () => void;
  onEditEvidenceImages?: () => void;
}

export const RealEvidenceSection: React.FC<RealEvidenceSectionProps> = ({
  title,
  subtitle,
  badge,
  customCaptions,
  contactAddress,
  contactWorkingHours,
  isAdmin = false,
  onEditSection,
  onEditEvidenceImages,
}) => {
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    caption: string;
    tag: string;
  } | null>(null);

  // Custom photos from admin/Firebase cache if any
  const [customPhotos, setCustomPhotos] = useState<Record<number, string>>(
    () => getLocalMediaAssets().evidenceImages
  );

  useEffect(() => {
    const handleUpdate = () => {
      setCustomPhotos(getLocalMediaAssets().evidenceImages);
    };
    handleUpdate();
    window.addEventListener('kdt_evidence_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('kdt_evidence_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <section id="kho-thuc-te" className="py-16 sm:py-24 bg-neutral-900 text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{badge || "Năng Lực Kho Bãi & Giao Vận KDT-89 · Hồ Chí Minh & Các Tỉnh Lân Cận"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
              {title || siteConfig.realEvidence.title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 mt-2 leading-relaxed">
              {subtitle || siteConfig.realEvidence.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && onEditEvidenceImages && (
              <button
                type="button"
                onClick={onEditEvidenceImages}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold self-start shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Đổi 6 Ảnh Kho</span>
              </button>
            )}

            {isAdmin && onEditSection && (
              <button
                type="button"
                onClick={onEditSection}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold border border-neutral-700 self-start shrink-0 cursor-pointer"
              >
                ✏️ Sửa Chữ Kho Bãi
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl bg-neutral-800/90 border border-neutral-700 max-w-sm shrink-0">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Tổng kho KDT-89:
            </div>
            <div className="text-xs text-neutral-200 mt-1 leading-snug">
              {contactAddress || siteConfig.contact.address}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between gap-2">
              <span>Mở cửa: {contactWorkingHours || siteConfig.contact.workingHours}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3" /> Sẵn hàng
              </span>
            </div>
          </div>
        </div>

        {/* 6 Real Evidence Image Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteConfig.realEvidence.items.map((item) => {
            const currentSrc = customPhotos[item.id] || item.imageSrc;
            const override = customCaptions?.[String(item.id)];
            const displayTag = override?.tag || item.tag;
            const displayCaption = override?.caption || item.caption;

            return (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                {/* Visual Area */}
                <div 
                  onClick={() => setSelectedImage({ src: currentSrc, caption: displayCaption, tag: displayTag })}
                  className="cursor-pointer relative"
                  title="Nhấp để phóng to xem chi tiết"
                >
                  <PlaceholderImage
                    src={currentSrc}
                    alt={displayCaption}
                    aspect="aspect-4/3"
                    label={item.placeholderLabel}
                    className="bg-neutral-900"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />

                  {/* Top unboxed tag */}
                  <div className="absolute top-3 left-3 text-[11px] font-semibold text-neutral-200 bg-neutral-900/80 backdrop-blur-xs px-2 py-1 rounded border border-neutral-700 pointer-events-none">
                    {displayTag}
                  </div>

                  {/* Zoom affordance */}
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-neutral-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white pointer-events-none">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Caption & Details - Sạch sẽ, không hiện nút tải ảnh đối với khách */}
                <div className="p-4 bg-neutral-950 border-t border-neutral-800/80">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-100 leading-snug line-clamp-2">
                    {displayCaption}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="w-3 h-3 shrink-0" />
                      <span>Chứng từ kho đầy đủ</span>
                    </span>

                    <span className="text-neutral-500 font-medium">
                      KDT-89 TP.HCM
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Lightbox */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative max-w-4xl w-full bg-neutral-900 border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img 
                  src={selectedImage.src} 
                  alt={selectedImage.caption} 
                  className="w-full max-h-[75vh] object-contain bg-black"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Đóng ảnh"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6 bg-neutral-900 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                    {selectedImage.tag}
                  </span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {selectedImage.caption}
                  </p>
                </div>
                <div className="text-xs text-neutral-400 shrink-0 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Kho hàng KDT-89</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
