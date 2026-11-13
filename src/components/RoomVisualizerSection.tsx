import React, { useState, useMemo, useEffect } from 'react';
import { 
  Maximize2, 
  Users, 
  Wind, 
  Tv, 
  Sparkles, 
  Flame, 
  Check, 
  Info, 
  ArrowRight, 
  RotateCcw, 
  Building2, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ShoppingBag,
  MessageCircle,
  SlidersHorizontal,
  Layers,
  Compass,
  Plus,
  Images,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { RoomModelItem, DEFAULT_ROOM_MODELS } from '../services/siteContentService';
import { RoomSlideshowViewer, SlideApplianceId, SlideApplianceBadge } from './RoomSlideshowViewer';

export interface RoomConfigSelection {
  area: number;
  occupants: number;
  roomType: string;
  tier: 'economy' | 'standard' | 'premium';
  includedItems: string[];
  totalEstimate: number;
  roomCountMultiplier: number;
}

interface RoomVisualizerProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  toggleCtaText?: string;
  defaultExpanded?: boolean;
  expandSignal?: number;
  isAdmin?: boolean;
  roomModels?: RoomModelItem[];
  onOpenAdmin3D?: () => void;
  onEditSection?: () => void;
  onApplyToQuote: (config: {
    projectType: string;
    roomCount: number;
    selectedItems: string[];
    tier: string;
    estimatedSummary: string;
    roomArea: number;
    occupants: number;
  }) => void;
}

interface ApplianceInfo {
  id: string;
  name: string;
  category: string;
  iconName: string;
  recommendation: string;
  specs: string;
  brands: string;
  estimatedPrice: number;
  zone: 'ac' | 'fridge' | 'water_heater' | 'tv' | 'washer';
  // Hotspot coordinates on 3D isometric render (% top & % left)
  pos3D: { top: string; left: string };
}

const DEFAULT_3D_ROOM_IMAGE = '/assets/rooms/chdv_bedroom_ac_tv.jpg';

export const RoomVisualizerSection: React.FC<RoomVisualizerProps> = ({
  title = "Setup Thiết Bị Nội Thất Chuẩn Theo Diện Tích & Số Người",
  subtitle = "Mô phỏng mặt bằng căn phòng thực tế theo số m² và người ở. KDT-89 tự động tính toán đúng công suất máy lạnh, dung tích tủ lạnh và thiết bị tối ưu chi phí.",
  badge = "Mô Phỏng Căn Phòng Trực Quan",
  toggleCtaText = "Xem Hình Ảnh Căn Hộ & Setup Thiết Bị",
  defaultExpanded = false,
  expandSignal = 0,
  isAdmin = false,
  roomModels = DEFAULT_ROOM_MODELS,
  onOpenAdmin3D,
  onEditSection,
  onApplyToQuote,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  useEffect(() => {
    if (expandSignal > 0) {
      setIsExpanded(true);
      const el = document.getElementById('setup-can-phong');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
    }
  }, [expandSignal]);

  const modelsList = roomModels && roomModels.length > 0 ? roomModels : DEFAULT_ROOM_MODELS;
  const [selectedModelId, setSelectedModelId] = useState<string>(modelsList[0]?.id || 'studio-standard');

  // Active 3D model
  const activeModel = useMemo(() => {
    return modelsList.find(m => m.id === selectedModelId) || modelsList[0];
  }, [modelsList, selectedModelId]);

  // 1. Interactive controls state
  const [area, setArea] = useState<number>(activeModel?.area || 20);
  const [occupants, setOccupants] = useState<number>(activeModel?.occupants || 2);
  const [roomType, setProjectType] = useState<string>(activeModel?.roomType || 'Căn hộ dịch vụ (CHDV)');
  const [tier, setTier] = useState<'economy' | 'standard' | 'premium'>('standard');
  const [totalRooms, setTotalRooms] = useState<number>(10);
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>('ac');
  
  // View mode: 'slideshow' (Animated Slideshow / GIF) or '2d' (Architectural Blueprint)
  const [viewMode, setViewMode] = useState<'slideshow' | '2d'>('slideshow');

  // Handle switching room models
  const handleSelectModel = (model: RoomModelItem) => {
    setSelectedModelId(model.id);
    setArea(model.area);
    setOccupants(model.occupants);
    if (model.roomType) setProjectType(model.roomType);
  };

  // Toggle equipment inclusion
  const [enabledItems, setEnabledItems] = useState<Record<string, boolean>>({
    ac: true,
    water_heater: true,
    fridge: true,
    tv: true,
    washer: true,
  });

  // Calculate technical specs and appliance recommendations based on area & occupants
  const appliances = useMemo((): Record<string, ApplianceInfo> => {
    // 1. Air conditioner sizing
    let acSpecs = '1.0 HP Inverter (9.000 BTU) · Tiết kiệm điện';
    let acRecom = 'Phù hợp phòng nhỏ kín, ít nắng chiều trực diện';
    let acPrice = tier === 'economy' ? 5300000 : tier === 'standard' ? 6800000 : 9200000;
    let acBrands = tier === 'economy' ? 'Casper, Gree, Midea' : tier === 'standard' ? 'Aqua, Toshiba, LG' : 'Daikin, Panasonic Inverter';

    if (area >= 17 && area <= 24) {
      acSpecs = '1.5 HP Inverter (12.000 BTU) · Làm lạnh sâu';
      acRecom = 'Chuẩn kỹ thuật phòng 17-24m², làm lạnh nhanh, máy chạy êm';
      acPrice = tier === 'economy' ? 6900000 : tier === 'standard' ? 8400000 : 11500000;
    } else if (area >= 25 && area <= 34) {
      acSpecs = '2.0 HP Inverter (18.000 BTU) · Công suất lớn';
      acRecom = 'Khuyên dùng cho phòng 25-34m² hoặc căn Studio có bếp đun nấu';
      acPrice = tier === 'economy' ? 10800000 : tier === 'standard' ? 13200000 : 17800000;
    } else if (area >= 35) {
      acSpecs = '2.5 HP Inverter (21.000 - 24.000 BTU)';
      acRecom = 'Dành cho căn hộ 1PN-2PN thông phòng hoặc diện tích lớn';
      acPrice = tier === 'economy' ? 14500000 : tier === 'standard' ? 17500000 : 23000000;
    }

    // 2. Fridge sizing based on occupants
    let fridgeSpecs = '90L - 100L Mini 1 cánh gọn nhẹ';
    let fridgeRecom = 'Gọn gàng, tiết kiệm diện tích tối đa cho 1 người ở';
    let fridgePrice = tier === 'economy' ? 2400000 : tier === 'standard' ? 2800000 : 3400000;
    let fridgeBrands = 'Aqua, Casper, Funiki';

    if (occupants === 2) {
      fridgeSpecs = '150L - 180L Ngăn đá trên (Inverter)';
      fridgeRecom = 'Dung tích chuẩn cho cặp đôi hoặc 2 bạn sinh viên / NVVP';
      fridgePrice = tier === 'economy' ? 3800000 : tier === 'standard' ? 4600000 : 5900000;
      fridgeBrands = tier === 'economy' ? 'Aqua, Casper' : tier === 'standard' ? 'Toshiba, Sharp Inverter' : 'Panasonic, Samsung';
    } else if (occupants >= 3) {
      fridgeSpecs = '208L - 250L Inverter 2 cánh kháng khuẩn';
      fridgeRecom = 'Ngăn đông rộng, bảo quản thực phẩm thoải mái cho 3-4 người';
      fridgePrice = tier === 'economy' ? 4900000 : tier === 'standard' ? 5900000 : 7900000;
      fridgeBrands = tier === 'economy' ? 'Aqua Inverter' : tier === 'standard' ? 'Toshiba, Panasonic' : 'Samsung, Hitachi';
    }

    // 3. Water Heater sizing
    let whSpecs = 'Máy nước nóng trực tiếp có bơm trợ lực + chống giật ELCB';
    let whRecom = 'Khởi động nóng tức thì, có bơm trợ lực mạnh kể cả lầu áp mái';
    let whPrice = tier === 'economy' ? 2100000 : tier === 'standard' ? 2700000 : 3800000;
    let whBrands = 'Ariston, Ferroli, Panasonic';

    if (roomType.includes('Khách sạn') || tier === 'premium') {
      whSpecs = 'Bình nước nóng gián tiếp 20L - 30L tráng men Titan';
      whRecom = 'Giữ nhiệt 48h, an toàn tuyệt đối, phù hợp bồn tắm & khách sạn cao cấp';
      whPrice = tier === 'economy' ? 2600000 : tier === 'standard' ? 3400000 : 4500000;
      whBrands = 'Ariston Andris2, Ferroli';
    }

    // 4. TV sizing based on area
    let tvSpecs = 'Smart TV 32 inch HD viền mỏng · Youtube/Netflix';
    let tvPrice = tier === 'economy' ? 3100000 : tier === 'standard' ? 3800000 : 4900000;
    let tvBrands = tier === 'economy' ? 'Casper, Coocaa' : tier === 'standard' ? 'TCL, Xiaomi Google TV' : 'Sony, Samsung 4K';

    if (area >= 22 && area <= 32) {
      tvSpecs = 'Smart TV 43 inch 4K UHD điều khiển giọng nói';
      tvPrice = tier === 'economy' ? 4800000 : tier === 'standard' ? 5900000 : 7500000;
    } else if (area > 32) {
      tvSpecs = 'Smart TV 50 inch - 55 inch 4K Tràn viền';
      tvPrice = tier === 'economy' ? 6600000 : tier === 'standard' ? 7900000 : 10500000;
    }

    // 5. Washer sizing
    let washerSpecs = 'Máy giặt cửa trên 8.5kg - 9.0kg Inverter';
    let washerRecom = 'Lồng giặt kháng khuẩn, chống rối đồ, bền bỉ dễ bảo trì';
    let washerPrice = tier === 'economy' ? 3900000 : tier === 'standard' ? 4800000 : 6200000;
    let washerBrands = tier === 'economy' ? 'Aqua, Midea' : tier === 'standard' ? 'Toshiba, Panasonic' : 'LG Inverter, Electrolux';

    if (occupants >= 3 || tier === 'premium') {
      washerSpecs = 'Máy giặt cửa trước (lồng ngang) 9.0kg - 10kg Inverter';
      washerRecom = 'Giặt sạch sâu, tiết kiệm nước tối đa, tôn vẻ sang trọng cho căn hộ';
      washerPrice = tier === 'economy' ? 6200000 : tier === 'standard' ? 7600000 : 10500000;
      washerBrands = 'LG AI DD, Electrolux UltimateCare';
    }

    return {
      ac: {
        id: 'ac',
        name: 'Máy Lạnh Inverter',
        category: 'Điều hòa không khí',
        iconName: 'Wind',
        recommendation: acRecom,
        specs: acSpecs,
        brands: acBrands,
        estimatedPrice: acPrice,
        zone: 'ac',
        // In 3D isometric view: mounted on back-right wall above the bed
        pos3D: { top: '24%', left: '76%' },
      },
      water_heater: {
        id: 'water_heater',
        name: 'Máy Nước Nóng ELCB',
        category: 'Nhiệt & Vệ sinh',
        iconName: 'Flame',
        recommendation: whRecom,
        specs: whSpecs,
        brands: whBrands,
        estimatedPrice: whPrice,
        zone: 'water_heater',
        // In 3D isometric view: in the enclosed bathroom cabin
        pos3D: { top: '21%', left: '40%' },
      },
      fridge: {
        id: 'fridge',
        name: 'Tủ Lạnh Lưu Trữ',
        category: 'Bảo quản thực phẩm',
        iconName: 'Sparkles',
        recommendation: fridgeRecom,
        specs: fridgeSpecs,
        brands: fridgeBrands,
        estimatedPrice: fridgePrice,
        zone: 'fridge',
        // In 3D isometric view: under the kitchen wooden counter
        pos3D: { top: '34%', left: '60%' },
      },
      tv: {
        id: 'tv',
        name: 'Smart TV Giải Trí',
        category: 'Hình ảnh & Giải trí',
        iconName: 'Tv',
        recommendation: `Kích thước chuẩn cho khoảng cách nhìn trong phòng ${area}m²`,
        specs: tvSpecs,
        brands: tvBrands,
        estimatedPrice: tvPrice,
        zone: 'tv',
        // In 3D isometric view: mounted facing the central sofa
        pos3D: { top: '70%', left: '33%' },
      },
      washer: {
        id: 'washer',
        name: 'Máy Giặt Căn Hộ',
        category: 'Giặt giũ & Tiện ích',
        iconName: 'RotateCcw',
        recommendation: washerRecom,
        specs: washerSpecs,
        brands: washerBrands,
        estimatedPrice: washerPrice,
        zone: 'washer',
        // In 3D isometric view: utility / entryway zone near desk/door
        pos3D: { top: '48%', left: '16%' },
      },
    };
  }, [area, occupants, roomType, tier]);

  // Compute total per 1 room
  const singleRoomTotal = useMemo(() => {
    return Object.keys(appliances).reduce((sum, key) => {
      if (enabledItems[key]) {
        return sum + appliances[key].estimatedPrice;
      }
      return sum;
    }, 0);
  }, [appliances, enabledItems]);

  const buildingTotal = singleRoomTotal * totalRooms;

  const toggleItem = (key: string) => {
    setEnabledItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApply = () => {
    const includedCategoryNames = Object.keys(appliances)
      .filter(k => enabledItems[k])
      .map(k => `${appliances[k].name} (${appliances[k].specs})`);

    const summary = `Setup căn phòng ${area}m² (${occupants} người) - Gói ${tier === 'economy' ? 'Tiết kiệm' : tier === 'standard' ? 'Tiêu chuẩn' : 'Cao cấp'} - Ước tính ~${(singleRoomTotal / 1000000).toFixed(1)} tr/phòng (x${totalRooms} phòng = ~${(buildingTotal / 1000000).toFixed(1)} tr)`;

    onApplyToQuote({
      projectType: roomType,
      roomCount: totalRooms,
      selectedItems: includedCategoryNames,
      tier: tier === 'economy' ? 'Tiết kiệm' : tier === 'standard' ? 'Tiêu chuẩn' : 'Cao cấp',
      estimatedSummary: summary,
      roomArea: area,
      occupants: occupants,
    });
  };

  const activeAppliance = appliances[selectedApplianceId] || appliances.ac;

  return (
    <section id="setup-can-phong" className="py-10 sm:py-14 bg-neutral-900 text-white relative overflow-hidden border-y border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${isExpanded ? 'mb-6 pb-6 border-b border-neutral-800' : 'mb-5'}`}>
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold tracking-wide uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-expanded={true}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-colors cursor-pointer"
              >
                <ChevronUp className="w-4 h-4 text-orange-400" />
                <span>Thu gọn</span>
              </button>
            )}

            {isAdmin && onOpenAdmin3D && (
              <button
                type="button"
                onClick={onOpenAdmin3D}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Images className="w-3.5 h-3.5" />
                <span>Quản Lý Ảnh Thực Tế Căn Hộ</span>
              </button>
            )}

            {isAdmin && onEditSection && (
              <button
                type="button"
                onClick={onEditSection}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold border border-neutral-700 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Sửa Tiêu Đề</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact Collapsed Banner Card (shown when apartment images are hidden/collapsed) */}
        {!isExpanded && (
          <div className="rounded-2xl bg-neutral-950/90 border border-neutral-800 p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                <span className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 font-semibold text-orange-300">
                  12–50 m² · 1–5+ người
                </span>
                <span className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 font-semibold">
                  7 góc ảnh thực tế CHDV &amp; Studio
                </span>
                <span className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 font-semibold">
                  Tính công suất &amp; giá sỉ theo tòa nhà
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Nhấn nút bên cạnh để mở phần hình ảnh căn hộ mẫu và công cụ chọn thiết bị chuẩn kỹ thuật.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              aria-expanded={false}
              className="w-full lg:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-orange-950/50 inline-flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] shrink-0"
            >
              <Images className="w-4 h-4 shrink-0" />
              <span>{toggleCtaText || "Xem Hình Ảnh Căn Hộ & Setup Thiết Bị"}</span>
              <ChevronDown className="w-4 h-4 shrink-0" />
            </button>
          </div>
        )}

        {/* Smooth Slide-Down Accordion Body */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
            isExpanded
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden">
            {/* Top Control Bar: Area, Occupants, Room Type, Tier */}
            <div className="bg-neutral-950/95 rounded-2xl border border-neutral-800 p-4 sm:p-6 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Diện tích phòng (m2) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-orange-400" />
                  Diện Tích Phòng:
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-orange-600/30 text-orange-300 font-extrabold text-sm border border-orange-500/40">
                  {area} m²
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="12"
                max="50"
                step="1"
                value={area}
                onChange={(e) => setArea(parseInt(e.target.value, 10))}
                className="w-full accent-orange-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {[15, 20, 25, 30, 40].map((m2) => (
                  <button
                    key={m2}
                    type="button"
                    onClick={() => setArea(m2)}
                    className={`flex-1 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                      area === m2
                        ? 'bg-orange-600 text-white'
                        : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {m2}m²
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Số người ở */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  Số Người Ở:
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-600/30 text-amber-300 font-extrabold text-sm border border-amber-500/40">
                  {occupants} người
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { count: 1, label: '1 người' },
                  { count: 2, label: '2 người' },
                  { count: 3, label: '3-4 ng' },
                  { count: 5, label: '5+ ng' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setOccupants(item.count)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                      occupants === item.count
                        ? 'bg-amber-500 text-neutral-950 shadow-md font-black'
                        : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400">
                {occupants === 1 && '💡 Đề xuất tủ mini 90L, máy lạnh 1.0 HP.'}
                {occupants === 2 && '💡 Đề xuất tủ lạnh 150-180L, máy giặt 8.5kg.'}
                {occupants >= 3 && '💡 Đề xuất tủ 208-250L Inverter, máy lạnh 1.5-2.0 HP.'}
              </p>
            </div>

            {/* 3. Loại hình công trình */}
            <div className="space-y-2.5">
              <span className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Mô Hình Phòng:
              </span>
              <select
                value={roomType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Căn hộ dịch vụ (CHDV)">Căn hộ dịch vụ (CHDV tiêu chuẩn)</option>
                <option value="Phòng trọ cao cấp">Nhà trọ cao cấp có gác lửng</option>
                <option value="Khách sạn / Homestay">Khách sạn / Homestay / Boutique</option>
                <option value="Căn hộ Studio / 1PN">Căn hộ chung cư mini Studio / 1PN</option>
              </select>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>Quy mô: </span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={totalRooms}
                  onChange={(e) => setTotalRooms(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-14 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-white text-center font-bold text-xs"
                />
                <span>phòng cả tòa</span>
              </div>
            </div>

            {/* 4. Phân khúc đầu tư */}
            <div className="space-y-2.5">
              <span className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Gói Ngân Sách:
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'economy', label: 'Tiết kiệm', desc: 'Vốn thấp' },
                  { id: 'standard', label: 'Tiêu chuẩn', desc: 'Bán chạy' },
                  { id: 'premium', label: 'Cao cấp', desc: 'Hàng Nhật' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTier(item.id as any)}
                    className={`py-1.5 px-1 text-center rounded-lg transition-all cursor-pointer ${
                      tier === item.id
                        ? 'bg-gradient-to-br from-orange-600 to-amber-600 text-white font-bold shadow-md'
                        : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    <span className="block text-[11px] font-bold leading-tight">{item.label}</span>
                    <span className="block text-[9.5px] opacity-80 leading-tight">{item.desc}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400">
                {tier === 'economy' && '✓ Casper, Midea, Aqua - Thu hồi vốn nhanh'}
                {tier === 'standard' && '✓ Toshiba, LG, Aqua Inverter - Bền & Tiết kiệm'}
                {tier === 'premium' && '✓ Daikin, Panasonic, Electrolux - Đẳng cấp'}
              </p>
            </div>

          </div>
        </div>

        {/* MAIN VISUALIZER WORKSPACE: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 3D ISOMETRIC ROOM & 2D BLUEPRINT VIEWPORT */}
          <div className="lg:col-span-7 bg-neutral-950 rounded-2xl border border-neutral-800 p-4 sm:p-6 shadow-2xl relative">
            
            {/* Model Presets Selector Bar */}
            <div className="mb-4 flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-neutral-850">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Images className="w-3.5 h-3.5 text-orange-400" />
                  <span>Chọn Mẫu Căn Hộ:</span>
                </span>
                {modelsList.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelectModel(model)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedModelId === model.id
                        ? 'bg-orange-600 text-white shadow-sm ring-1 ring-orange-400'
                        : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800'
                    }`}
                  >
                    <span>{model.name}</span>
                  </button>
                ))}
              </div>

              {isAdmin && onOpenAdmin3D && (
                <button
                  type="button"
                  onClick={onOpenAdmin3D}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-orange-950 text-orange-400 border border-orange-500/30 text-[11px] font-bold shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm Ảnh Thực Tế</span>
                </button>
              )}
            </div>

            {/* Viewport Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-neutral-800 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-bold text-neutral-200 uppercase tracking-wider">
                  {activeModel?.name} ({area}m² · {occupants} Người)
                </span>
              </div>

              {/* View Switcher: Real Apartment Slideshow vs 2D Blueprint */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('slideshow')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'slideshow'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Images className="w-3.5 h-3.5" />
                  <span>Ảnh Thực Tế / GIF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('2d')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === '2d'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Mặt Bằng 2D</span>
                </button>
              </div>
            </div>

            {/* VIEW MODE 1: ANIMATED SLIDESHOW & GIF ROOM VIEWER */}
            {viewMode === 'slideshow' ? (
              <RoomSlideshowViewer
                area={area}
                occupants={occupants}
                roomType={roomType}
                tier={tier}
                activeModelId={activeModel?.id || 'studio-standard'}
                activeModelImageSrc={activeModel?.imageSrc || DEFAULT_3D_ROOM_IMAGE}
                activeModelName={activeModel?.name}
                enabledItems={enabledItems}
                selectedApplianceId={selectedApplianceId}
                onSelectAppliance={(id) => setSelectedApplianceId(id)}
                applianceBadges={{
                  ac: {
                    id: 'ac',
                    shortLabel: `Máy Lạnh ${appliances.ac.specs.split(' ')[0]} ${appliances.ac.specs.split(' ')[1]}`,
                  },
                  water_heater: {
                    id: 'water_heater',
                    shortLabel: (roomType.includes('Khách sạn') || tier === 'premium') ? 'Bình Gián Tiếp 20-30L' : 'Nước Nóng Trực Tiếp',
                  },
                  fridge: {
                    id: 'fridge',
                    shortLabel: `Tủ Lạnh ${appliances.fridge.specs.split(' ')[0]}`,
                  },
                  tv: {
                    id: 'tv',
                    shortLabel: appliances.tv.specs.split('·')[0].trim(),
                  },
                  washer: {
                    id: 'washer',
                    shortLabel: (occupants >= 3 || tier === 'premium') ? 'Máy Giặt Cửa Trước' : 'Máy Giặt Cửa Trên',
                  },
                } as Record<SlideApplianceId, SlideApplianceBadge>}
              />
            ) : (
              /* VIEW MODE 2: 2D ARCHITECTURAL BLUEPRINT CANVAS */
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-neutral-900/90 rounded-xl border-2 border-neutral-700/80 p-4 overflow-hidden select-none">
                
                {/* Floor architectural grid pattern */}
                <div 
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                  }}
                />

                {/* Room Dimensions Label */}
                <div className="absolute top-2 left-3 text-[10px] text-neutral-400 font-mono tracking-wider">
                  RỘNG: {Math.sqrt(area * 1.25).toFixed(1)}m × DÀI: {(area / Math.sqrt(area * 1.25)).toFixed(1)}m = {area}m²
                </div>

                {/* Window on Top Wall */}
                <div className="absolute top-0 left-1/3 w-1/3 h-2 bg-sky-400/80 rounded-b shadow-[0_2px_10px_rgba(56,189,248,0.5)] flex items-center justify-center">
                  <span className="text-[8px] font-bold text-neutral-950 uppercase tracking-tighter">CỬA SỔ LẤY SÁNG</span>
                </div>

                {/* Entrance Door on Bottom Right with Swing Arc */}
                <div className="absolute bottom-0 right-8 w-16 h-2 bg-amber-600 rounded-t flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white uppercase tracking-tighter">CỬA CHÍNH</span>
                  <div className="absolute bottom-2 right-0 w-14 h-14 border-t-2 border-r-2 border-dashed border-amber-500/40 rounded-tr-full pointer-events-none" />
                </div>

                {/* ZONE 1: Sleeping Zone */}
                <div className="absolute top-8 left-6 w-32 sm:w-44 h-24 sm:h-32 bg-neutral-800/90 border border-neutral-700 rounded-lg p-2 flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-semibold">{occupants === 1 ? 'Giường Đơn 1m4' : 'Giường Queen 1m8'}</span>
                    <span>Khu Ngủ</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-10 sm:w-12 h-6 bg-neutral-700 rounded-md border border-neutral-600" />
                    {occupants > 1 && (
                      <div className="w-10 sm:w-12 h-6 bg-neutral-700 rounded-md border border-neutral-600" />
                    )}
                  </div>
                  <div className="w-full h-10 bg-neutral-750 rounded-sm border-t border-neutral-650" />
                </div>

                {/* ZONE 2: Bathroom / WC Enclosure */}
                <div className="absolute bottom-4 left-6 w-28 sm:w-36 h-24 sm:h-28 bg-neutral-850 border-2 border-neutral-700/80 rounded-lg p-2 shadow-inner">
                  <div className="text-[9px] font-bold text-neutral-400 uppercase border-b border-neutral-700 pb-1 mb-1">
                    WC / Phòng Tắm
                  </div>
                  <div className="flex justify-between items-end h-14">
                    <div className="w-6 h-6 rounded-full border border-neutral-600 flex items-center justify-center text-[8px] text-neutral-400">
                      Lavabo
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedApplianceId('water_heater')}
                      className={`relative p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                        selectedApplianceId === 'water_heater'
                          ? 'bg-amber-500 text-neutral-950 border-amber-300 ring-2 ring-amber-400 scale-105 shadow-lg'
                          : enabledItems.water_heater
                            ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/80'
                            : 'bg-neutral-800 text-neutral-500 border-neutral-700 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] font-extrabold leading-tight">Máy Nước Nóng</span>
                      </div>
                      <span className="block text-[8px] opacity-90 truncate max-w-[80px]">
                        {appliances.water_heater.specs.split(' ')[0]}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Hotspot: MÁY LẠNH TREO TƯỜNG (Top right wall) */}
                <div className="absolute top-4 right-10 flex flex-col items-end">
                  <button
                    type="button"
                    onClick={() => setSelectedApplianceId('ac')}
                    className={`px-3 py-1.5 rounded-lg border text-right transition-all cursor-pointer ${
                      selectedApplianceId === 'ac'
                        ? 'bg-cyan-500 text-neutral-950 border-cyan-300 ring-2 ring-cyan-400 scale-105 shadow-xl'
                        : enabledItems.ac
                          ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/60 hover:bg-cyan-900'
                          : 'bg-neutral-800 text-neutral-500 border-neutral-700 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-[10.5px] font-black uppercase">
                        Máy Lạnh: {appliances.ac.specs.split(' ')[0]} {appliances.ac.specs.split(' ')[1]}
                      </span>
                      <Wind className="w-4 h-4 shrink-0 text-cyan-400" />
                    </div>
                    <span className="text-[9px] text-cyan-200 block">
                      Đề xuất cho {area}m²
                    </span>
                  </button>
                </div>

                {/* Hotspot: SMART TV */}
                <div className="absolute top-28 sm:top-36 right-6">
                  <button
                    type="button"
                    onClick={() => setSelectedApplianceId('tv')}
                    className={`px-3 py-1.5 rounded-lg border transition-all text-left cursor-pointer ${
                      selectedApplianceId === 'tv'
                        ? 'bg-purple-500 text-white border-purple-300 ring-2 ring-purple-400 scale-105 shadow-xl'
                        : enabledItems.tv
                          ? 'bg-purple-950/70 text-purple-300 border-purple-500/60 hover:bg-purple-900'
                          : 'bg-neutral-800 text-neutral-500 border-neutral-700 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[10px] font-extrabold">{appliances.tv.name}</span>
                    </div>
                    <span className="block text-[8.5px] opacity-90 truncate max-w-[90px]">
                      {appliances.tv.specs.split('·')[0]}
                    </span>
                  </button>
                </div>

                {/* ZONE 3: Kitchenette & Utility (Bottom Center) */}
                <div className="absolute bottom-4 left-36 sm:left-48 flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApplianceId('fridge')}
                    className={`p-2 rounded-lg border transition-all text-center cursor-pointer ${
                      selectedApplianceId === 'fridge'
                        ? 'bg-emerald-500 text-neutral-950 border-emerald-300 ring-2 ring-emerald-400 scale-105 shadow-xl'
                        : enabledItems.fridge
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900'
                          : 'bg-neutral-800 text-neutral-500 border-neutral-700 opacity-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="block text-[10px] font-black">{appliances.fridge.name}</span>
                    <span className="block text-[8px] opacity-90 truncate max-w-[80px]">
                      {appliances.fridge.specs.split(' ')[0]}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedApplianceId('washer')}
                    className={`p-2 rounded-lg border transition-all text-center cursor-pointer ${
                      selectedApplianceId === 'washer'
                        ? 'bg-blue-500 text-white border-blue-300 ring-2 ring-blue-400 scale-105 shadow-xl'
                        : enabledItems.washer
                          ? 'bg-blue-950/70 text-blue-300 border-blue-500/60 hover:bg-blue-900'
                          : 'bg-neutral-800 text-neutral-500 border-neutral-700 opacity-50'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span className="block text-[10px] font-black">{appliances.washer.name}</span>
                    <span className="block text-[8px] opacity-90 truncate max-w-[80px]">
                      {appliances.washer.specs.split(' ')[0]}
                    </span>
                  </button>
                </div>

              </div>
            )}

            {/* Quick Toggle Checklist Under Viewport */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-neutral-400 mr-1">Thiết bị trong gói:</span>
                {Object.keys(appliances).map((key) => {
                  const item = appliances[key];
                  const isChecked = enabledItems[key];
                  const isSelected = selectedApplianceId === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedApplianceId(key)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-600 text-white font-bold ring-2 ring-orange-400/40 shadow-sm'
                          : isChecked
                            ? 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800'
                            : 'bg-neutral-950 text-neutral-600 border border-neutral-900 line-through opacity-50'
                      }`}
                    >
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(key);
                        }}
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-black ${
                          isChecked ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-700 text-neutral-400'
                        }`}
                        title="Bật / Tắt món này khỏi gói"
                      >
                        {isChecked ? '✓' : '✕'}
                      </span>
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[10.5px] text-neutral-500 italic">
                * Bấm vào tên thiết bị để xem chi tiết
              </span>
            </div>
          </div>

          {/* RIGHT: Detailed Specs & Financial Estimate Card */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Active Selected Appliance Detail Card */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-850">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
                      {activeAppliance.category}
                    </span>
                    <h4 className="text-base font-extrabold text-white">
                      {activeAppliance.name}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block">Giá sỉ KDT-89</span>
                  <span className="text-base font-black text-orange-400 tracking-tight">
                    ~{(activeAppliance.estimatedPrice).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Specs & Brands */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-200">Đề xuất kỹ thuật cho phòng {area}m²:</span>
                      <p className="text-neutral-300 mt-0.5 font-medium text-orange-300">{activeAppliance.specs}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-neutral-800/80">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-200">Phù hợp nhu cầu:</span>
                      <p className="text-neutral-400 mt-0.5">{activeAppliance.recommendation}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-900/60 border border-neutral-850 text-neutral-300">
                  <span className="text-neutral-400">Thương hiệu đề xuất:</span>
                  <span className="font-bold text-white">{activeAppliance.brands}</span>
                </div>
              </div>

              {/* Inclusion Switch */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Trạng thái trong gói:</span>
                <button
                  type="button"
                  onClick={() => toggleItem(activeAppliance.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    enabledItems[activeAppliance.id]
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                  }`}
                >
                  {enabledItems[activeAppliance.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đang chọn trong gói</span>
                    </>
                  ) : (
                    <span>Đã tắt (Không tính vào báo giá)</span>
                  )}
                </button>
              </div>
            </div>

            {/* Total Budget Calculator Card */}
            <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-orange-950/30 rounded-2xl border border-orange-500/30 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Ước tính trọn gói 1 phòng ({area}m²)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-orange-400 tracking-tight mt-0.5">
                    ~{(singleRoomTotal).toLocaleString('vi-VN')} <span className="text-sm font-semibold text-neutral-400">đ/phòng</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Cả tòa ({totalRooms} phòng)
                  </span>
                  <div className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                    ~{(buildingTotal / 1000000).toFixed(1)} <span className="text-xs font-semibold text-neutral-400">triệu</span>
                  </div>
                </div>
              </div>

              {/* Value guarantees */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Đầy đủ VAT &amp; CO-CQ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Giao tận chân công trình</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Bảo hành chính hãng 100%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Chiết khấu sỉ theo số lượng</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Áp Dụng Gói Phòng Này Vào Báo Giá</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`${siteConfig.contact.primaryZaloUrl}?text=${encodeURIComponent(`Chào Điện Máy KDT-89, tôi đang xem mô hình 3D căn phòng ${area}m2 (${occupants} người), quy mô ${totalRooms} phòng. Nhờ gửi bảng giá đại lý chi tiết!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>Tư Vấn Zalo Nhanh Gói Phòng Này (Ms. Ngọc)</span>
                </a>
              </div>
            </div>

          </div>

        </div>

            {/* Bottom Collapse Action */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-colors cursor-pointer"
              >
                <ChevronUp className="w-4 h-4 text-orange-400" />
                <span>Thu gọn hình ảnh căn hộ</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
