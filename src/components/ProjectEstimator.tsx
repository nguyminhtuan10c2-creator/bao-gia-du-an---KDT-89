import React, { useState, useId } from 'react';
import { siteConfig } from '../config/siteConfig';
import { KdtLogo } from './KdtLogo';
import { CheckSquare, Square, ArrowRight, MessageCircle, Check } from 'lucide-react';

interface ProjectEstimatorProps {
  onApplyToQuote: (config: {
    projectType: string;
    roomCount: number;
    selectedItems: string[];
    tier: string;
    estimatedSummary: string;
  }) => void;
}

interface EquipmentOption {
  id: string;
  name: string;
  category: string;
  defaultPerRoom: number;
  tiers: {
    budget: { model: string; price: number };
    balanced: { model: string; price: number };
    premium: { model: string; price: number };
  };
}

const EQUIPMENT_CATALOG: EquipmentOption[] = [
  {
    id: "may-lanh",
    name: "Máy lạnh (Inverter 1.0 HP - 1.5 HP)",
    category: "Làm mát",
    defaultPerRoom: 1,
    tiers: {
      budget: { model: "Casper / Funiki Inverter 1.0 HP", price: 4900000 },
      balanced: { model: "Toshiba / Aqua Inverter 1.0 HP", price: 5800000 },
      premium: { model: "Daikin / Panasonic Inverter 1.0 - 1.5 HP", price: 7900000 },
    }
  },
  {
    id: "may-tam-nong",
    name: "Máy tắm nóng (Trực tiếp / Gián tiếp)",
    category: "Phòng tắm",
    defaultPerRoom: 1,
    tiers: {
      budget: { model: "Casper / Ferroli trực tiếp có ELCB", price: 1450000 },
      balanced: { model: "Ariston trực tiếp trợ lực / Gián tiếp 15L", price: 2150000 },
      premium: { model: "Ariston gián tiếp 20L - 30L tráng men Titan", price: 2850000 },
    }
  },
  {
    id: "tu-lanh",
    name: "Tủ lạnh (Mini 90L hoặc 2 cánh)",
    category: "Bếp & Phòng",
    defaultPerRoom: 1,
    tiers: {
      budget: { model: "Aqua / Casper Mini 90L", price: 2500000 },
      balanced: { model: "Aqua / Casper 2 cánh Inverter 140L - 180L", price: 3950000 },
      premium: { model: "LG / Toshiba 2 cánh Inverter 205L - 250L", price: 5400000 },
    }
  },
  {
    id: "may-giat",
    name: "Máy giặt (Lồng đứng hoặc Lồng ngang)",
    category: "Giặt là",
    defaultPerRoom: 0.5,
    tiers: {
      budget: { model: "Aqua lồng đứng 8.5kg (dùng chung dãy trọ)", price: 4200000 },
      balanced: { model: "Toshiba / Aqua lồng đứng 10kg Inverter", price: 5600000 },
      premium: { model: "LG / Electrolux lồng ngang 9kg Inverter riêng phòng", price: 8200000 },
    }
  },
  {
    id: "tivi",
    name: "Smart TV (32\" - 50\" 4K)",
    category: "Giải trí",
    defaultPerRoom: 1,
    tiers: {
      budget: { model: "Casper / TCL Smart TV 32\"", price: 3100000 },
      balanced: { model: "Casper / TCL 4K Smart TV 43\"", price: 4600000 },
      premium: { model: "LG / Samsung 4K UHD 43\" - 50\"", price: 6800000 },
    }
  },
  {
    id: "gia-dung-khac",
    name: "Bếp từ âm/dương & Hút mùi",
    category: "Nhà bếp",
    defaultPerRoom: 1,
    tiers: {
      budget: { model: "Bếp từ đơn + Hút mùi cổ điển", price: 1600000 },
      balanced: { model: "Bếp từ đôi hồng ngoại âm kính cường lực", price: 2900000 },
      premium: { model: "Bộ Bếp đôi Kaff / Sunhouse + Hút mùi kính cong", price: 4500000 },
    }
  },
];

export const ProjectEstimator: React.FC<ProjectEstimatorProps> = ({ onApplyToQuote }) => {
  const roomCountId = useId();
  const [selectedProjectType, setSelectedProjectType] = useState<string>("chdv");
  const [roomCount, setRoomCount] = useState<number>(10);
  const [qualityTier, setQualityTier] = useState<"budget" | "balanced" | "premium">("balanced");
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([
    "may-lanh",
    "may-tam-nong",
    "tu-lanh",
    "tivi"
  ]);
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  const toggleEquipment = (id: string) => {
    if (selectedEquipmentIds.includes(id)) {
      if (selectedEquipmentIds.length > 1) {
        setSelectedEquipmentIds(selectedEquipmentIds.filter(item => item !== id));
      }
    } else {
      setSelectedEquipmentIds([...selectedEquipmentIds, id]);
    }
  };

  // Calculations
  const activeItems = EQUIPMENT_CATALOG.filter(item => selectedEquipmentIds.includes(item.id));
  
  const estimatedPerRoomCost = activeItems.reduce((sum, item) => {
    return sum + item.tiers[qualityTier].price * (item.id === 'may-giat' && selectedProjectType === 'nha-tro' ? 0.2 : 1);
  }, 0);

  const totalEstimatedCost = estimatedPerRoomCost * roomCount;

  const totalDeviceUnits = activeItems.reduce((count, item) => {
    if (item.id === 'may-giat' && selectedProjectType === 'nha-tro') {
      return count + Math.ceil(roomCount / 5);
    }
    return count + roomCount;
  }, 0);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const currentProjectName = siteConfig.projectTypes.find(p => p.id === selectedProjectType)?.title || "Công trình";

  const getTierName = () => {
    if (qualityTier === 'budget') return "Tiết Kiệm Tối Ưu";
    if (qualityTier === 'balanced') return "Cân Bằng & Bền Bỉ";
    return "Cao Cấp Sang Trọng";
  };

  const handleApplyConfig = () => {
    const summaryText = `${currentProjectName} (${roomCount} phòng) - Gói ${getTierName()} - ${activeItems.map(i => i.name.split('(')[0].trim()).join(', ')}`;
    onApplyToQuote({
      projectType: currentProjectName,
      roomCount,
      selectedItems: activeItems.map(i => i.name),
      tier: getTierName(),
      estimatedSummary: summaryText,
    });
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 3000);
  };

  const generateZaloMessage = () => {
    const text = `Xin chào Điện Máy KDT-89, tôi cần tư vấn báo giá công trình:
- Loại hình: ${currentProjectName}
- Quy mô: ${roomCount} phòng
- Gói định hướng: ${getTierName()}
- Danh mục thiết bị: ${activeItems.map(i => i.name.split('(')[0].trim()).join(', ')}
- Dự toán ước tính: khoảng ${formatVND(totalEstimatedCost)}
Nhờ KDT-89 gửi bảng báo giá chi tiết và phương án chiết khấu qua Zalo giúp tôi. Cảm ơn!`;
    return encodeURIComponent(text);
  };

  return (
    <section id="du-toan" className="py-14 sm:py-20 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Nền trắng, Chữ to MÀU CAM, Chữ nhỏ MÀU ĐEN */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-900">
            <KdtLogo className="w-5 h-5 shrink-0" />
            <span>Công Cụ Dự Toán Báo Giá KDT-89</span>
            <span className="text-neutral-300">·</span>
            <span className="text-neutral-700 font-medium normal-case">Ước tính quy mô &amp; ngân sách tức thì</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-orange-600 mt-2">
            Tính toán nhanh danh mục thiết bị theo số phòng
          </h2>
          <p className="text-sm sm:text-base text-neutral-800 mt-2 leading-relaxed font-normal">
            Chọn mô hình công trình, số phòng và nhóm thiết bị để ước tính số lượng và ngân sách sơ bộ. Bạn có thể gửi cấu hình này trực tiếp cho chuyên viên KDT-89 để chốt đơn giá chiết khấu dự án.
          </p>
        </div>

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column (7 cols): Nền trắng, giao diện viền sắc nét */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 space-y-7 shadow-xs">
            
            {/* Step 1: Chọn loại công trình */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
                1. Loại hình công trình
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {siteConfig.projectTypes.map(project => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setSelectedProjectType(project.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      selectedProjectType === project.id
                        ? 'border-orange-600 bg-orange-50 text-orange-900 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-800 bg-white'
                    }`}
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Chọn số lượng phòng */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor={roomCountId} className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  2. Số lượng phòng / căn hộ: <span className="text-orange-600 font-black text-sm tabular-nums">{roomCount} phòng</span>
                </label>
                <div className="flex gap-1.5">
                  {[5, 10, 15, 20, 30, 50].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setRoomCount(cnt)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer font-bold ${
                        roomCount === cnt
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <input
                id={roomCountId}
                type="range"
                min="2"
                max="80"
                step="1"
                value={roomCount}
                onChange={(e) => setRoomCount(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-[11px] text-neutral-600 font-medium mt-1 tabular-nums">
                <span>2 phòng</span>
                <span>20 phòng</span>
                <span>40 phòng</span>
                <span>60 phòng</span>
                <span>80+ phòng</span>
              </div>
            </div>

            {/* Step 3: Định hướng phân khúc thiết bị */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
                3. Định hướng phân khúc thiết bị
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'budget', label: 'Tiết Kiệm Tối Ưu', desc: 'Casper, Funiki, Aqua' },
                  { id: 'balanced', label: 'Cân Bằng & Bền Bỉ', desc: 'Toshiba, Ariston, Aqua Inverter' },
                  { id: 'premium', label: 'Cao Cấp Sang Trọng', desc: 'Daikin, Panasonic, LG 4K' },
                ].map(tier => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setQualityTier(tier.id as any)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      qualityTier === tier.id
                        ? 'border-orange-600 bg-orange-50 text-orange-950 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-800 bg-white'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{tier.label}</div>
                    <div className={`text-[11px] mt-0.5 truncate ${qualityTier === tier.id ? 'text-orange-800 font-medium' : 'text-neutral-600'}`}>
                      {tier.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Thiết bị cần trang bị */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
                4. Danh mục thiết bị dự kiến trang bị
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EQUIPMENT_CATALOG.map(equip => {
                  const isChecked = selectedEquipmentIds.includes(equip.id);
                  const tierData = equip.tiers[qualityTier];

                  return (
                    <div
                      key={equip.id}
                      onClick={() => toggleEquipment(equip.id)}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-colors ${
                        isChecked 
                          ? 'border-orange-500 bg-orange-50/60 shadow-xs' 
                          : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/70 text-neutral-700'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Square className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-neutral-900">{equip.name}</div>
                        <div className="text-[11px] text-neutral-700 mt-0.5 truncate">{tierData.model}</div>
                        <div className="text-[11px] text-orange-700 font-extrabold mt-0.5 tabular-nums">
                          ~ {formatVND(tierData.price)} / máy
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Result / Estimation Summary Column (5 cols) - SỬA THEO YÊU CẦU: NỀN TRẮNG, CHỮ TO MÀU CAM, CHỮ NHỎ MÀU ĐEN, NÚT NỀN CAM CHỮ TRẮNG */}
          <div className="lg:col-span-5 bg-white text-neutral-900 rounded-2xl border-2 border-orange-200/90 p-6 sm:p-7 space-y-6 shadow-xl sticky top-24">
            
            {/* Header Thẻ: Có Logo KDT + Tiêu đề màu cam to */}
            <div className="border-b border-orange-100 pb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <KdtLogo className="w-6 h-6 shrink-0" />
                <span className="text-xs uppercase tracking-wider text-orange-600 font-extrabold">
                  Dự Toán Sơ Bộ Tham Khảo
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-orange-600 mt-1">
                {currentProjectName} ({roomCount} phòng)
              </h3>
              <p className="text-xs text-neutral-800 mt-1 font-medium">
                Phân khúc: <span className="text-orange-600 font-bold">{getTierName()}</span> · Đã chọn {activeItems.length} nhóm thiết bị
              </p>
            </div>

            {/* Metrics breakdown: Chữ nhỏ màu đen, Số nổi bật */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-neutral-800">Ước tính / mỗi phòng:</span>
                <span className="text-base font-extrabold text-neutral-900 tabular-nums">
                  ~ {formatVND(estimatedPerRoomCost)}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-neutral-800">Tổng số lượng thiết bị dự kiến:</span>
                <span className="text-base font-black text-neutral-900 tabular-nums">
                  {totalDeviceUnits} sản phẩm
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">Tổng mức đầu tư sơ bộ:</span>
                  <span className="text-[11px] text-neutral-600 font-normal">*Đơn giá tham khảo, KDT-89 chiết khấu thêm theo lô thực tế</span>
                </div>
                <div className="text-right shrink-0">
                  {/* CHỮ SIZE LỚN MÀU CAM */}
                  <span className="text-2xl sm:text-3xl font-black text-orange-600 tabular-nums block">
                    {formatVND(totalEstimatedCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* List of included items: Hộp nền nhẹ tinh tế, chữ đen */}
            <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-2">
              <div className="text-xs font-bold text-neutral-900">Thiết bị bao gồm trong gói:</div>
              <ul className="text-xs text-neutral-800 space-y-1.5 font-medium">
                {activeItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between text-[11px]">
                    <span className="truncate pr-2 font-semibold text-neutral-900">✓ {item.name.split('(')[0]}</span>
                    <span className="text-neutral-700 shrink-0 tabular-nums">{item.tiers[qualityTier].model.split(' ')[0]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action buttons: NÚT NỀN CAM, CHỮ TRẮNG */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleApplyConfig}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-extrabold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl shadow-md hover:shadow-orange-600/30 transition-all cursor-pointer"
              >
                {appliedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Đã chuyển vào Form báo giá phía dưới!</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 text-white" />
                    <span>Nạp cấu hình này vào Form Báo Giá</span>
                  </>
                )}
              </button>

              <a
                href={`${siteConfig.contact.primaryZaloUrl}?text=${generateZaloMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>Nhắn Zalo kèm cấu hình này ({siteConfig.contact.hotlines[0].display})</span>
              </a>
            </div>

            <div className="text-[11px] text-neutral-600 text-center font-medium">
              Chuyên viên dự án KDT-89 sẽ tư vấn model phù hợp mặt bằng và tiến độ bàn giao
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
