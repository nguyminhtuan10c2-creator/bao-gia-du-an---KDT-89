import React, { useState, useEffect } from 'react';
import { siteConfig } from '../config/siteConfig';
import { KdtLogo } from './KdtLogo';
import { 
  X, 
  Upload, 
  RotateCcw, 
  Check, 
  Image as ImageIcon, 
  ShieldCheck, 
  HelpCircle, 
  Eye, 
  FolderCheck,
  AlertCircle 
} from 'lucide-react';

interface AdminMediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'logo' | 'hero' | 'gallery' | 'guide'>('logo');
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [currentHero, setCurrentHero] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedLogo = localStorage.getItem('kdt_custom_logo');
      const savedHero = localStorage.getItem('kdt89_custom_hero_image');
      setCurrentLogo(savedLogo || null);
      setCurrentHero(savedHero || null);
    }
  }, [isOpen]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // 1. Xử lý tải Logo thủ công từ máy tính/điện thoại
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          try {
            localStorage.setItem('kdt_custom_logo', reader.result);
            setCurrentLogo(reader.result);
            window.dispatchEvent(new Event('kdt_logo_updated'));
            showSuccess('Đã cập nhật Logo mới thành công cho toàn bộ website!');
          } catch {
            alert('File ảnh logo quá lớn, anh hãy chọn file nhẹ hơn (dưới 3MB) hoặc định dạng PNG/JPG/SVG nhé!');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    localStorage.removeItem('kdt_custom_logo');
    setCurrentLogo(null);
    window.dispatchEvent(new Event('kdt_logo_updated'));
    showSuccess('Đã khôi phục Logo về mặc định!');
  };

  // 2. Xử lý tải Ảnh Hero từ máy
  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          try {
            localStorage.setItem('kdt89_custom_hero_image', reader.result);
            setCurrentHero(reader.result);
            window.dispatchEvent(new Event('kdt_hero_updated'));
            showSuccess('Đã thay đổi ảnh đầu trang (Hero) thành công!');
          } catch {
            alert('File ảnh quá lớn, anh hãy chọn file nhẹ hơn (dưới 4MB) nhé!');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetHero = () => {
    localStorage.removeItem('kdt89_custom_hero_image');
    setCurrentHero(null);
    window.dispatchEvent(new Event('kdt_hero_updated'));
    showSuccess('Đã khôi phục ảnh Hero về mặc định!');
  };

  // 3. Xử lý tải ảnh kho bãi (6 vị trí)
  const handleEvidenceUpload = (itemId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          try {
            const saved = localStorage.getItem('kdt_custom_evidence');
            const data = saved ? JSON.parse(saved) : {};
            data[itemId] = reader.result;
            localStorage.setItem('kdt_custom_evidence', JSON.stringify(data));
            window.dispatchEvent(new Event('kdt_evidence_updated'));
            showSuccess(`Đã cập nhật ảnh vị trí #${itemId} thành công!`);
          } catch {
            alert('Bộ nhớ trình duyệt đầy, anh hãy chọn ảnh nhẹ hơn nhé!');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAllEvidence = () => {
    localStorage.removeItem('kdt_custom_evidence');
    window.dispatchEvent(new Event('kdt_evidence_updated'));
    showSuccess('Đã khôi phục tất cả ảnh kho bãi về mặc định!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white text-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200">
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-600 text-white">
              <KdtLogo className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Quản Trị Logo &amp; Hình Ảnh KDT-89</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Dành riêng cho chủ web
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Thay đổi Logo, hình ảnh thực tế và quản lý hiển thị cho khách hàng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Đóng bảng quản trị"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 gap-2 pt-3 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'logo'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            1. Thay Logo KDT
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'hero'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            2. Thay Ảnh Đầu Trang (Hero)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            3. Thay Ảnh Kho &amp; Công Trình
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Giải đáp &amp; Hướng dẫn (Không cần Drive)</span>
          </button>
        </div>

        {/* Thông báo thành công */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: THAY LOGO THỦ CÔNG */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                <h4 className="text-sm font-bold text-orange-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Thay thế Logo công ty KDT thủ công</span>
                </h4>
                <p className="text-xs text-orange-900/90 mt-1">
                  Anh có thể chọn file logo thực tế trên máy tính hoặc điện thoại (như file <b>logo Cty KDT new-04.jpg</b> hoặc PNG nền trong suốt). Website sẽ lập tức cập nhật logo này vào Header, Hero, Bảng dự toán và Chân trang!
                </p>
              </div>

              {/* Preview Logo hiện tại */}
              <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Logo đang hiển thị trên web:
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-xs inline-flex items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center p-1 bg-neutral-50 rounded-lg border border-neutral-100">
                      <KdtLogo className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-orange-600">Điện Máy KDT-89</div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {currentLogo ? 'Đang dùng: Logo do anh tải lên' : 'Đang dùng: Logo mặc định'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nút bấm tải logo lên & Đổi mật khẩu */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <label className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Tải ảnh Logo từ máy của anh</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {currentLogo && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Khôi phục ban đầu</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Khu vực bảo mật mật khẩu admin */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <span>🔐</span>
                    <span>Mật khẩu bảo vệ chế độ Quản trị (?admin)</span>
                  </div>
                  <p className="text-neutral-600 mt-0.5">
                    Mật khẩu mặc định: <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold font-mono">kdt89admin</code>. Anh có thể đổi sang mật khẩu riêng bất cứ lúc nào.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentPass = localStorage.getItem('kdt_admin_pass') || 'kdt89admin';
                    const newPass = window.prompt(`Mật khẩu hiện tại đang là: ${currentPass}\n\nNhập mật khẩu quản trị mới anh muốn đổi (ít nhất 4 ký tự):`);
                    if (newPass && newPass.trim().length >= 4) {
                      localStorage.setItem('kdt_admin_pass', newPass.trim());
                      showSuccess(`Đã đổi mật khẩu quản trị thành: "${newPass.trim()}"!`);
                    } else if (newPass !== null) {
                      alert('Mật khẩu cần ít nhất 4 ký tự!');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  🔑 Đổi mật khẩu
                </button>
              </div>

              {/* Hướng dẫn khi xuất bản web chính thức */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2 text-xs">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <FolderCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cách thay Logo cố định khi triển khai web lên Vercel / Host:</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  Để logo lưu vĩnh viễn trong mã nguồn web, anh chỉ cần chép file ảnh logo của anh vào thư mục <b>public/logo.png</b> trong bộ mã nguồn. Website sẽ tự động tải file này làm logo chính thức.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: THAY ẢNH HERO */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200">
                <h4 className="text-sm font-bold text-neutral-900">
                  Ảnh bìa kho hàng KDT-89 ở phần đầu trang
                </h4>
                <p className="text-xs text-neutral-600 mt-1">
                  Anh có thể tải ảnh chụp kho thực tế, bảng hiệu công ty hoặc xe giao hàng để thay cho ảnh mẫu.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden border border-neutral-300 shrink-0 bg-neutral-900">
                  <img
                    src={currentHero || siteConfig.galleryAssets.hero}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="text-xs font-bold text-neutral-800">
                    Trạng thái: {currentHero ? 'Đang dùng ảnh tự tải lên từ thiết bị' : 'Đang dùng ảnh kho mẫu sẵn có'}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Chọn ảnh mới từ máy</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroUpload}
                        className="hidden"
                      />
                    </label>

                    {currentHero && (
                      <button
                        type="button"
                        onClick={handleResetHero}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Đặt lại ảnh mẫu</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THAY ẢNH KHO & CÔNG TRÌNH */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">
                    6 Khung ảnh thực tế kho vận KDT-89
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Anh có thể tải ảnh riêng cho từng mục bên dưới
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetAllEvidence}
                  className="text-xs font-bold text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                >
                  Khôi phục tất cả ảnh mẫu
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {siteConfig.realEvidence.items.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-neutral-200 overflow-hidden shrink-0 border border-neutral-300">
                        <img src={item.imageSrc} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-neutral-900 truncate">{item.tag}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{item.caption}</div>
                      </div>
                    </div>

                    <label className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 hover:border-orange-500 hover:text-orange-600 text-neutral-700 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleEvidenceUpload(item.id, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GIẢI ĐÁP & HƯỚNG DẪN */}
          {activeTab === 'guide' && (
            <div className="space-y-5 text-neutral-800">
              
              {/* Câu hỏi 1 */}
              <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-orange-600 text-white shrink-0 mt-0.5">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-orange-950">
                      1. "Khách xem web có thấy chữ 'Thay ảnh' không em?"
                    </h4>
                    <div className="text-xs text-orange-900/90 mt-2 space-y-1.5 leading-relaxed">
                      <p className="font-bold text-emerald-800">
                        &rarr; HOÀN TOÀN KHÔNG ANH NHÉ!
                      </p>
                      <p>
                        Giao diện dành cho khách hàng đã được dọn sạch 100%. Mọi khách hàng, đối tác công trình khi truy cập trang web <b>tuyệt đối không nhìn thấy bất kỳ chữ "Thay ảnh", "Thử tải ảnh" hay các nút kỹ thuật nào</b>.
                      </p>
                      <p>
                        Họ chỉ nhìn thấy một trang web công ty chuyên nghiệp, hình ảnh sắc nét, bảng tính dự toán chỉn chu và nút nhận báo giá rõ ràng của Điện Máy KDT-89.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Câu hỏi 2 */}
              <div className="p-5 rounded-2xl bg-neutral-100 border border-neutral-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-neutral-800 text-white shrink-0 mt-0.5">
                    <FolderCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-neutral-900">
                      2. "Ảnh trên máy tính của anh thì sao, anh phải up lên Google Drive hả?"
                    </h4>
                    <div className="text-xs text-neutral-700 mt-2 space-y-1.5 leading-relaxed">
                      <p className="font-bold text-neutral-900">
                        &rarr; KHÔNG CẦN PHẢI UP LÊN GOOGLE DRIVE ANH NHÉ!
                      </p>
                      <p>
                        <b>• Khi dùng thử trên web ngay bây giờ:</b> Anh chỉ cần bấm nút <b>"Tải ảnh Logo từ máy của anh"</b> ở Tab 1 bên trên, chọn file ảnh từ máy tính hoặc điện thoại là website tự nhận và lưu lại ngay lập tức.
                      </p>
                      <p>
                        <b>• Khi đưa web lên Vercel / Tên miền chính thức:</b> Anh không cần đưa ảnh lên Drive làm gì cho nặng và chậm web. Anh chỉ việc copy trực tiếp các file ảnh từ máy của anh vào thư mục dự án:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-1 text-neutral-800 font-medium">
                        <li>File Logo: Đổi tên thành <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono text-[11px]">logo.png</code> rồi chép vào thư mục <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono text-[11px]">public/logo.png</code></li>
                        <li>File Ảnh kho &amp; thiết bị: Chép vào thư mục <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono text-[11px]">src/assets/images/</code> hoặc dán link trong file <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono text-[11px]">siteConfig.ts</code>.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Câu hỏi 3: Logo */}
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-blue-950">
                      3. "Logo anh tự thay thế thủ công được không, anh thấy nó sai logo anh rồi?"
                    </h4>
                    <div className="text-xs text-blue-900/90 mt-2 space-y-1.5 leading-relaxed">
                      <p className="font-bold text-blue-950">
                        &rarr; Dạ được 100% anh nhé!
                      </p>
                      <p>
                        Vừa rồi em tạo logo mẫu tạm thời dạng vector SVG nên nét chữ chưa thể khớp 100% với file thiết kế gốc của công ty KDT.
                      </p>
                      <p>
                        Anh chỉ cần qua <b>Tab 1 (Thay Logo KDT)</b> &rarr; bấm <b>"Tải ảnh Logo từ máy của anh"</b> &rarr; chọn file logo gốc của anh (như file <i>logo Cty KDT new-04.jpg</i> hoặc file PNG trong suốt). Hệ thống sẽ ngay lập tức thay thế toàn bộ logo trên web thành file ảnh chuẩn xác của công ty anh!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-500 font-medium">
            Điện Máy KDT-89 · Bảng điều khiển quản trị viên
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng bảng quản trị
          </button>
        </div>

      </div>
    </div>
  );
};
