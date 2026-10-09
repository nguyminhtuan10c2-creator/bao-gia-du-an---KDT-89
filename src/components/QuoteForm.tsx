import React, { useState, useEffect } from 'react';
import { siteConfig, FORM_ENDPOINT } from '../config/siteConfig';
import { saveLead } from '../utils/leadStorage';
import { Send, CheckCircle2, AlertCircle, MessageCircle, Phone, ArrowRight, Loader2, Sparkles, Database } from 'lucide-react';

interface QuoteFormProps {
  initialConfig?: {
    projectType?: string;
    roomCount?: number;
    selectedItems?: string[];
    tier?: string;
    estimatedSummary?: string;
  } | null;
  onOpenLeadsManager?: () => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ initialConfig, onOpenLeadsManager }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectType, setProjectType] = useState('Căn hộ dịch vụ (CHDV)');
  const [roomCount, setRoomCount] = useState('10');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Máy lạnh',
    'Máy tắm nóng',
    'Tủ lạnh',
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'fallback_success' | 'error'>('idle');
  const [phoneError, setPhoneError] = useState('');

  // Update when parent passes configuration
  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.projectType) setProjectType(initialConfig.projectType);
      if (initialConfig.roomCount) setRoomCount(initialConfig.roomCount.toString());
      if (initialConfig.selectedItems && initialConfig.selectedItems.length > 0) {
        setSelectedCategories(initialConfig.selectedItems.map(item => item.split('(')[0].trim()));
      }
      if (initialConfig.estimatedSummary) {
        setNotes((prev) => prev ? `${prev}\n[Dự toán: ${initialConfig.estimatedSummary}]` : `[Dự toán: ${initialConfig.estimatedSummary}]`);
      }
    }
  }, [initialConfig]);

  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== catName));
      }
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\s+/g, '');
    const regex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return regex.test(clean);
  };

  const buildZaloMessage = () => {
    const text = `Kính gửi Điện Máy KDT-89,
Tôi cần nhận bảng báo giá công trình:
- Người liên hệ: ${fullName || 'Khách hàng'}
- Số điện thoại: ${phoneNumber}
- Khu vực công trình: ${projectAddress || 'TP.HCM'}
- Loại công trình: ${projectType}
- Quy mô: ${roomCount} phòng
- Nhóm thiết bị cần: ${selectedCategories.join(', ')}
${notes ? `- Yêu cầu cụ thể: ${notes}` : ''}

Nhờ KDT-89 gửi báo giá chi tiết và phương án chiết khấu.`;
    return encodeURIComponent(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    if (!phoneNumber.trim()) {
      setPhoneError('Vui lòng nhập số điện thoại hoặc Zalo để nhận báo giá');
      return;
    }

    if (!validatePhone(phoneNumber.trim())) {
      setPhoneError('Số điện thoại chưa đúng định dạng (VD: 0918064167)');
      return;
    }

    setIsSubmitting(true);

    const leadPayload = {
      timestamp: new Date().toISOString(),
      fullName: fullName.trim() || 'Khách hàng liên hệ',
      phoneNumber: phoneNumber.trim(),
      projectAddress: projectAddress.trim() || 'Chưa cung cấp',
      projectType,
      roomCount,
      selectedCategories: selectedCategories.join(', '),
      notes: notes.trim(),
    };

    // 1. Luôn lưu vào danh sách quản lý Leads trên máy (đảm bảo 100% không mất thông tin khách)
    saveLead(leadPayload);

    // 2. Gửi đồng thời tới Webhook / Google Apps Script
    try {
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          ...leadPayload,
          source: 'Website dienmaykdt89.com',
        }),
      });

      setSubmitStatus('success');
    } catch (err) {
      console.warn('Form endpoint delivery notice:', err);
      setSubmitStatus('fallback_success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitStatus('idle');
    setFullName('');
    setPhoneNumber('');
    setProjectAddress('');
    setNotes('');
  };

  return (
    <section id="form-bao-gia" className="py-12 sm:py-16 bg-neutral-100/90 border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span>Tiếp Nhận Nhu Cầu 24/7</span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-600 font-normal normal-case">Phản hồi báo giá trong 30 phút</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mt-1.5">
              Đăng ký nhận báo giá thiết bị công trình
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Điền nhanh số phòng hoặc danh sách thiết bị. KDT-89 sẽ gửi bảng chiết khấu đại lý tốt nhất trực tiếp qua điện thoại hoặc Zalo.
            </p>
          </div>

          {onOpenLeadsManager && (
            <button
              type="button"
              onClick={onOpenLeadsManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
              title="Xem danh sách khách đã gửi và hướng dẫn Google Sheets"
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>Hộp thư Lead &amp; Google Sheet</span>
            </button>
          )}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-9 shadow-sm">
          
          {submitStatus === 'success' || submitStatus === 'fallback_success' ? (
            <div className="py-8 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-900">
                  KDT-89 Đã Ghi Nhận Yêu Cầu Báo Giá!
                </h3>
                <p className="text-sm text-neutral-600 max-w-lg mx-auto">
                  Chuyên viên phụ trách công trình sẽ liên hệ qua số điện thoại/Zalo <span className="font-semibold text-neutral-900">{phoneNumber}</span> trong ít phút để gửi bảng báo giá chi tiết.
                </p>
              </div>

              {/* Direct Zalo action for instant response */}
              <div className="pt-4 max-w-md mx-auto space-y-2">
                <a
                  href={`${siteConfig.contact.hotlines[0].zalo}?text=${buildZaloMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Mở Zalo gửi Ms. Ngọc ({siteConfig.contact.hotlines[0].display})</span>
                </a>

                <a
                  href={`${siteConfig.contact.hotlines[1].zalo}?text=${buildZaloMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Hoặc gửi Mr. Dũng ({siteConfig.contact.hotlines[1].display})</span>
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-neutral-500 hover:text-neutral-800 underline underline-offset-2 cursor-pointer pt-2"
                >
                  Gửi yêu cầu báo giá cho công trình khác
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: Tên & Số điện thoại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Họ tên / Đơn vị liên hệ
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Anh Minh (Chủ CHDV Quận 7)"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-neutral-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Số điện thoại / Zalo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="VD: 0918064167"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-neutral-50/50 focus:outline-none focus:ring-2 ${
                      phoneError
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-neutral-300 focus:ring-amber-500 focus:border-amber-500'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Loại công trình & Số phòng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Loại hình công trình
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-300 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    {siteConfig.projectTypes.map((pt) => (
                      <option key={pt.id} value={pt.title}>
                        {pt.title}
                      </option>
                    ))}
                    <option value="Khác">Mô hình khác...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Quy mô số phòng / căn dự kiến
                  </label>
                  <input
                    type="text"
                    value={roomCount}
                    onChange={(e) => setRoomCount(e.target.value)}
                    placeholder="VD: 12 phòng hoặc 20 căn"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-300 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 3: Địa chỉ công trình */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Địa chỉ hoặc khu vực thi công
                </label>
                <input
                  type="text"
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  placeholder="VD: Quận Bình Thạnh, TP.HCM hoặc TP. Thủ Dầu Một, Bình Dương"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-300 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Row 4: Nhóm thiết bị quan tâm */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Nhóm thiết bị cần trang bị (chọn các mục áp dụng)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {siteConfig.categories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.name);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.name)}
                        className={`p-2.5 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-amber-100/70 border-amber-500 text-amber-950 font-semibold'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isChecked && <span className="text-amber-700 font-bold ml-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Ghi chú */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Ghi chú thêm hoặc thương hiệu ưu tiên (nếu có)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Cần máy lạnh Casper 1.0 HP Inverter cho 15 phòng, giao đợt 1 trước 5 bộ..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-300 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi thông tin...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi Yêu Cầu Báo Giá KDT-89</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`${siteConfig.contact.hotlines[0].zalo}?text=${buildZaloMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 py-3 px-3.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
                    title={`Zalo Ms. Ngọc (${siteConfig.contact.hotlines[0].display})`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Zalo Ms. Ngọc ({siteConfig.contact.hotlines[0].display})</span>
                  </a>

                  <a
                    href={`${siteConfig.contact.hotlines[1].zalo}?text=${buildZaloMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 py-3 px-3.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
                    title={`Zalo Mr. Dũng (${siteConfig.contact.hotlines[1].display})`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Zalo Mr. Dũng ({siteConfig.contact.hotlines[1].display})</span>
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                <span>Dữ liệu được tự động gửi về bộ phận điều phối dự án &amp; lưu trữ an toàn.</span>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};

