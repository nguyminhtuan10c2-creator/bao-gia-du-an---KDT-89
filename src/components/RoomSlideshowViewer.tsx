import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wind,
  Flame,
  Sparkles,
  Tv,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Tag,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export type SlideApplianceId = 'ac' | 'water_heater' | 'fridge' | 'tv' | 'washer';

export interface SlideApplianceBadge {
  id: SlideApplianceId;
  shortLabel: string;
}

interface HotspotCoord {
  top: string;
  left: string;
}

type PartialHotspotLayout = Partial<Record<SlideApplianceId, HotspotCoord>>;

interface RoomSlide {
  id: string;
  src: string;
  label: string;
  subtitle: string;
  hotspots: PartialHotspotLayout;
}

interface RoomSlideshowViewerProps {
  area: number;
  occupants: number;
  roomType: string;
  tier: 'economy' | 'standard' | 'premium';
  activeModelId: string;
  activeModelImageSrc?: string;
  activeModelName?: string;
  enabledItems: Record<string, boolean>;
  selectedApplianceId: string;
  onSelectAppliance: (id: SlideApplianceId) => void;
  applianceBadges: Record<SlideApplianceId, SlideApplianceBadge>;
}

const BUILTIN_PATHS = new Set([
  '/assets/aistudio/image_b92b3cbf.png',
  '/assets/rooms/chdv_bedroom_ac_tv.jpg',
  '/assets/rooms/chdv_living_1pn.jpg',
  '/assets/rooms/chdv_compact_16m2_studio.jpg',
  '/assets/rooms/chdv_kitchen_fridge_washer.jpg',
  '/assets/rooms/chdv_utility_topload_washer.jpg',
  '/assets/rooms/chdv_bathroom_heater.jpg',
  '/assets/rooms/chdv_bathroom_indirect_tank.jpg',
]);

export const RoomSlideshowViewer: React.FC<RoomSlideshowViewerProps> = ({
  area,
  occupants,
  roomType,
  tier,
  activeModelId,
  activeModelImageSrc,
  activeModelName,
  enabledItems,
  selectedApplianceId,
  onSelectAppliance,
  applianceBadges,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const isFrontLoadWasher = occupants >= 3 || tier === 'premium';
  const isIndirectWaterHeater = roomType.includes('Khách sạn') || tier === 'premium';
  const isMiniFridge = occupants === 1;

  // Build slideshow whose photos strictly match area, occupants, washer type & water heater type
  const slides = useMemo<RoomSlide[]>(() => {
    const list: RoomSlide[] = [];

    // 0. If admin uploaded a custom project photo or GIF, lead with it
    const customSrc = activeModelImageSrc?.trim();
    if (customSrc && !BUILTIN_PATHS.has(customSrc)) {
      list.push({
        id: `custom-${activeModelId}`,
        src: customSrc,
        label: activeModelName || 'Ảnh Thực Tế Dự Án',
        subtitle:
          customSrc.toLowerCase().includes('.gif') || customSrc.startsWith('data:image/gif')
            ? 'Ảnh động GIF thực tế công trình KDT-89'
            : 'Ảnh chụp thực tế căn hộ mẫu KDT-89',
        hotspots: {},
      });
    }

    // 1. Primary living / sleeping photo matched strictly by room area (m²)
    if (area <= 17) {
      list.push({
        id: 'compact-16',
        src: '/assets/rooms/chdv_compact_16m2_studio.jpg',
        label: `Phòng Gọn ${area}m² · Ngủ & TV`,
        subtitle: `Bố trí thực tế phòng ${area}m²: Máy lạnh treo tường, Smart TV & góc bếp gọn`,
        hotspots: {
          ac: { top: '18%', left: '84%' },
          tv: { top: '44%', left: '13%' },
          ...(isMiniFridge ? { fridge: { top: '65%', left: '43%' } } : {}),
        },
      });
    } else if (area >= 27) {
      list.push({
        id: 'living-1pn-30',
        src: '/assets/rooms/chdv_living_1pn.jpg',
        label: `Căn Hộ ${area}m² · P.Khách`,
        subtitle: `Không gian rộng ${area}m²: Máy lạnh công suất lớn & Smart TV 43–50"`,
        hotspots: {
          ac: { top: '19%', left: '51%' },
          tv: { top: '48%', left: '51%' },
        },
      });
      list.push({
        id: 'bedroom-1pn',
        src: '/assets/rooms/chdv_bedroom_ac_tv.jpg',
        label: `Căn Hộ ${area}m² · P.Ngủ`,
        subtitle: `Phòng ngủ tách biệt trong căn hộ ${area}m² với máy lạnh riêng & TV`,
        hotspots: {
          ac: { top: '19%', left: '84%' },
          tv: { top: '46%', left: '34%' },
        },
      });
    } else {
      list.push({
        id: 'studio-20',
        src: '/assets/rooms/chdv_bedroom_ac_tv.jpg',
        label: `Studio ${area}m² · Khu Ngủ & TV`,
        subtitle: `Studio CHDV ${area}m²: Máy lạnh treo tường phòng ngủ & Smart TV đối diện`,
        hotspots: {
          ac: { top: '19%', left: '84%' },
          tv: { top: '46%', left: '34%' },
        },
      });
    }

    // 2. Kitchen & Laundry photo matched strictly to Top-Load vs Front-Load & Fridge size
    if (isFrontLoadWasher) {
      list.push({
        id: 'kitchen-frontload',
        src: '/assets/rooms/chdv_kitchen_fridge_washer.jpg',
        label: 'Bếp & Máy Giặt Lồng Ngang',
        subtitle: 'Ảnh thực tế Máy Giặt Cửa Trước (Lồng Ngang) lắp âm & Tủ Lạnh 2 cánh',
        hotspots: {
          fridge: { top: '58%', left: '80%' },
          washer: { top: '76%', left: '29%' },
        },
      });
    } else {
      list.push({
        id: 'kitchen-topload',
        src: '/assets/rooms/chdv_utility_topload_washer.jpg',
        label: 'Bếp & Máy Giặt Cửa Trên',
        subtitle: isMiniFridge
          ? 'Ảnh thực tế Máy Giặt Cửa Trên nắp kính tại logia giặt phơi (kèm khu bếp)'
          : 'Ảnh thực tế Máy Giặt Cửa Trên nắp kính & Tủ Lạnh Inverter 2 cánh cạnh bếp',
        hotspots: {
          washer: { top: '62%', left: '70%' },
          ...(!isMiniFridge ? { fridge: { top: '55%', left: '46%' } } : {}),
        },
      });
    }

    // If 1 person (90L Mini Fridge) and area > 17m², also include compact mini-fridge photo so fridge matches visually
    if (isMiniFridge && area > 17) {
      list.push({
        id: 'mini-fridge-corner',
        src: '/assets/rooms/chdv_compact_16m2_studio.jpg',
        label: 'Góc Bếp · Tủ Lạnh Mini 90L',
        subtitle: 'Tủ Lạnh Mini 90L - 100L đặt gọn dưới kệ bếp dành cho 1 người ở',
        hotspots: {
          fridge: { top: '65%', left: '43%' },
        },
      });
    }

    // 3. Bathroom photo matched strictly to Direct ELCB vs Indirect 20-30L Tank
    if (isIndirectWaterHeater) {
      list.push({
        id: 'bath-indirect',
        src: '/assets/rooms/chdv_bathroom_indirect_tank.jpg',
        label: 'Phòng Tắm · Bình Gián Tiếp',
        subtitle: 'Bình Nước Nóng Gián Tiếp 20L–30L lắp chuẩn kỹ thuật phía trên vách tắm kính',
        hotspots: {
          water_heater: { top: '21%', left: '68%' },
        },
      });
    } else {
      list.push({
        id: 'bath-direct',
        src: '/assets/rooms/chdv_bathroom_heater.jpg',
        label: 'Phòng Tắm · Máy Trực Tiếp',
        subtitle: 'Máy Nước Nóng Trực Tiếp ELCB & sen cây lắp gọn trong cabin tắm kính',
        hotspots: {
          water_heater: { top: '34%', left: '66%' },
        },
      });
    }

    return list;
  }, [
    area,
    isFrontLoadWasher,
    isIndirectWaterHeater,
    isMiniFridge,
    activeModelId,
    activeModelImageSrc,
    activeModelName,
  ]);

  // Reset to first slide when model preset or area tier changes substantially
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeModelId]);

  // Keep index in bounds when slides array length changes
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Auto-jump to the slide showcasing an appliance when user switches selected appliance
  const prevSelectedRef = useRef<string>(selectedApplianceId);
  useEffect(() => {
    if (prevSelectedRef.current === selectedApplianceId) return;
    prevSelectedRef.current = selectedApplianceId;

    const appId = selectedApplianceId as SlideApplianceId;
    const current = slides[currentIndex % slides.length];
    if (current && current.hotspots[appId]) {
      return;
    }
    const targetIdx = slides.findIndex((s) => Boolean(s.hotspots[appId]));
    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx);
    }
  }, [selectedApplianceId, slides, currentIndex]);

  // Smooth auto-play interval (5s)
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isPlaying, slides.length]);

  const safeIndex = currentIndex % slides.length;
  const currentSlide = slides[safeIndex];

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const renderBadgeIcon = (id: SlideApplianceId) => {
    switch (id) {
      case 'ac':
        return <Wind className="w-3 h-3 shrink-0" />;
      case 'water_heater':
        return <Flame className="w-3 h-3 shrink-0" />;
      case 'fridge':
        return <Sparkles className="w-3 h-3 shrink-0" />;
      case 'tv':
        return <Tv className="w-3 h-3 shrink-0" />;
      case 'washer':
        return <RotateCcw className="w-3 h-3 shrink-0" />;
    }
  };

  const badgeColors: Record<SlideApplianceId, { active: string; idle: string }> = {
    ac: {
      active: 'bg-cyan-500 text-neutral-950 border-white',
      idle: 'bg-neutral-950/90 text-cyan-300 border-cyan-500/60 hover:border-cyan-300',
    },
    water_heater: {
      active: 'bg-amber-500 text-neutral-950 border-white',
      idle: 'bg-neutral-950/90 text-amber-300 border-amber-500/60 hover:border-amber-300',
    },
    fridge: {
      active: 'bg-emerald-500 text-neutral-950 border-white',
      idle: 'bg-neutral-950/90 text-emerald-300 border-emerald-500/60 hover:border-emerald-300',
    },
    tv: {
      active: 'bg-purple-500 text-white border-white',
      idle: 'bg-neutral-950/90 text-purple-300 border-purple-500/60 hover:border-purple-300',
    },
    washer: {
      active: 'bg-blue-500 text-white border-white',
      idle: 'bg-neutral-950/90 text-blue-300 border-blue-500/60 hover:border-blue-300',
    },
  };

  return (
    <div className="space-y-3 select-none">
      {/* Main Full-Bleed Real Apartment Photography Slideshow */}
      <div className="relative w-full aspect-[4/3] bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden shadow-inner">
        {slides.map((slide, idx) => {
          const isActive = idx === safeIndex;
          return (
            <img
              key={slide.id}
              src={slide.src}
              alt={slide.label}
              loading={idx === 0 ? 'eager' : 'lazy'}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                isActive
                  ? isZoomed
                    ? 'opacity-100 scale-[1.15]'
                    : 'opacity-100 scale-100'
                  : 'opacity-0 scale-100 pointer-events-none'
              }`}
            />
          );
        })}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />

        {/* Top-Left Static Room Info Pill */}
        <div className="absolute top-3 left-3 z-20 bg-neutral-950/90 px-3 py-1.5 rounded-lg border border-neutral-800 shadow-lg flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="font-bold text-white">Căn hộ {area}m²</span>
          <span className="text-neutral-600">|</span>
          <span className="text-orange-400 font-semibold">{occupants} người</span>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <span className="hidden sm:inline text-neutral-300 text-[11px]">
            {currentSlide.label}
          </span>
        </div>

        {/* Top-Right Compact Controls */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsZoomed((z) => !z)}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 transition-colors cursor-pointer ${
              isZoomed
                ? 'bg-orange-600 text-white border-orange-400'
                : 'bg-neutral-950/90 text-neutral-300 border-neutral-800 hover:text-white'
            }`}
            title={isZoomed ? 'Thu nhỏ lại' : 'Phóng to xem chi tiết'}
          >
            {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setShowLabels((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 transition-colors cursor-pointer ${
              showLabels
                ? 'bg-neutral-950/90 text-orange-300 border-orange-500/50'
                : 'bg-neutral-950/90 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
            title="Hiện hoặc ẩn nhãn thiết bị trên ảnh"
          >
            <Tag className="w-3 h-3" />
            <span className="hidden sm:inline">{showLabels ? 'Ẩn tên' : 'Hiện tên'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-orange-600 text-white border-orange-400'
                : 'bg-neutral-950/90 text-neutral-300 border-neutral-800 hover:text-white'
            }`}
            title={isPlaying ? 'Tạm dừng tự chuyển ảnh' : 'Tự động phát slide căn hộ'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden sm:inline">{isPlaying ? 'Đang phát' : 'Phát slide'}</span>
          </button>
        </div>

        {/* Prev / Next Arrows */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Ảnh trước"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-neutral-950/85 hover:bg-orange-600 text-white border border-neutral-700 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Ảnh tiếp theo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-neutral-950/85 hover:bg-orange-600 text-white border border-neutral-700 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Static Appliance Tags matched accurately to current photo */}
        {showLabels && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {(Object.keys(currentSlide.hotspots) as SlideApplianceId[]).map((id) => {
              const coord = currentSlide.hotspots[id];
              if (!coord) return null;
              const badge = applianceBadges[id];
              const isSelected = selectedApplianceId === id;
              const isEnabled = Boolean(enabledItems[id]);
              const styleSet = badgeColors[id];

              return (
                <div
                  key={id}
                  className="absolute pointer-events-auto"
                  style={{ top: coord.top, left: coord.left }}
                >
                  <button
                    type="button"
                    onClick={() => onSelectAppliance(id)}
                    className={`-translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-lg text-[10px] sm:text-[10.5px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? `${styleSet.active} ring-2 ring-white/70`
                        : isEnabled
                          ? styleSet.idle
                          : 'bg-neutral-900/90 text-neutral-500 border-neutral-700 opacity-60'
                    }`}
                  >
                    {renderBadgeIcon(id)}
                    <span>{badge.shortLabel}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Caption */}
        <div className="absolute bottom-2.5 left-3 right-3 z-20 pointer-events-none flex items-center justify-between gap-2">
          <div className="bg-neutral-950/90 border border-neutral-800 rounded-lg px-3 py-1.5 text-[11px] text-neutral-200 shadow-md truncate">
            <span className="font-bold text-orange-400 mr-1.5">
              {safeIndex + 1}/{slides.length}:
            </span>
            <span>{currentSlide.subtitle}</span>
          </div>
        </div>
      </div>

      {/* Filmstrip Zone Selector Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {slides.map((slide, idx) => {
          const isActive = idx === safeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(idx);
              }}
              className={`relative rounded-lg overflow-hidden border text-left transition-all cursor-pointer bg-neutral-950 ${
                isActive
                  ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-md'
                  : 'border-neutral-800 opacity-75 hover:opacity-100 hover:border-neutral-600'
              }`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                <img
                  src={slide.src}
                  alt={slide.label}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-neutral-950 px-2 py-1.5 border-t border-neutral-800">
                <span
                  className={`block text-[10px] font-bold truncate ${
                    isActive ? 'text-orange-400' : 'text-neutral-300'
                  }`}
                >
                  {slide.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
