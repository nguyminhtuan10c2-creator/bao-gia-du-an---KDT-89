import React, { useState, useEffect } from 'react';
import { siteConfig } from '../config/siteConfig';
import { KdtLogo } from './KdtLogo';
import { compressImageFile, extractReadableFirebaseError } from '../utils/imageCompressor';
import {
  getLocalMediaAssets,
  saveLogoToFirebase,
  saveHeroImageToFirebase,
  saveEvidenceImageToFirebase,
  resetAllEvidenceImagesInFirebase,
  subscribeToMediaAssets,
  verifyFirebaseConnection,
} from '../services/mediaSyncService';
import {
  X,
  Upload,
  RotateCcw,
  Check,
  ShieldCheck,
  HelpCircle,
  Eye,
  FolderCheck,
  AlertCircle,
  Cloud,
  Link as LinkIcon,
  KeyRound,
  Loader2,
  WifiOff,
} from 'lucide-react';

interface AdminMediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'logo' | 'hero' | 'gallery' | 'guide';
}

export const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({
  isOpen,
  onClose,
  initialTab = 'logo',
}) => {
  const [activeTab, setActiveTab] = useState<'logo' | 'hero' | 'gallery' | 'guide'>(initialTab);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [currentHero, setCurrentHero] = useState<string | null>(null);
  const [evidenceMap, setEvidenceMap] = useState<Record<number, string>>({});
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [heroUrlInput, setHeroUrlInput] = useState('');
  const [evidenceUrlInputs, setEvidenceUrlInputs] = useState<Record<number, string>>({});
  const [isBusy, setIsBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  // Inline password change state (avoid blocked window.prompt in iframe)
  const [isEditingPass, setIsEditingPass] = useState(false);
  const [newPassInput, setNewPassInput] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    setErrorMessage(null);
    setFirebaseStatus('checking');

    const local = getLocalMediaAssets();
    setCurrentLogo(local.logoUrl);
    setCurrentHero(local.heroImageUrl);
    setEvidenceMap(local.evidenceImages);

    verifyFirebaseConnection().then((res) => {
      setFirebaseStatus(res.connected ? 'connected' : 'offline');
    });

    const unsub = subscribeToMediaAssets((media) => {
      setCurrentLogo(media.logoUrl);
      setCurrentHero(media.heroImageUrl);
      setEvidenceMap(media.evidenceImages);
    });
    return () => unsub();
  }, [isOpen, initialTab]);

  const showSuccess = (msg: string) => {
    setErrorMessage(null);
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (err: unknown) => {
    setSuccessMessage(null);
    setErrorMessage(extractReadableFirebaseError(err));
  };

  // 1. Logo Upload / URL / Reset
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsBusy(true);
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 460,
        maxHeight: 460,
        quality: 0.84,
        preserveTransparency: true,
        maxBase64Length: 115_000,
      });
      await saveLogoToFirebase(compressed);
      setCurrentLogo(compressed);
      setFirebaseStatus('connected');
      showSuccess('Đã cập nhật Logo mới và lưu vĩnh viễn lên Firebase!');
    } catch (err) {
      showError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveLogoUrl = async () => {
    if (!logoUrlInput.trim()) return;
    setIsBusy(true);
    try {
      await saveLogoToFirebase(logoUrlInput.trim());
      setCurrentLogo(logoUrlInput.trim());
      setLogoUrlInput('');
      setFirebaseStatus('connected');
      showSuccess('Đã cập nhật đường link Logo và lưu lên Firebase!');
    } catch (err) {
      showError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleResetLogo = async () => {
    setIsBusy(true);
    try {
      await saveLogoToFirebase(null);
      setCurrentLogo(null);
      setFirebaseStatus('connected');
      showSuccess('Đã khôi phục Logo về mặc định trên Firebase!');
    } catch (err) {
      showError(err);
    } finally {
      setIsBusy(false);
    }
  };

  // 2. Hero Image Upload / URL / Reset
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsBusy(true);
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 900,
        quality: 0.76,
        maxBase64Length: 135_000,
      });
      await saveHeroImageToFirebase(compressed);
      setCurrentHero(compressed);
      setFirebaseStatus('connected');
      showSuccess('Đã thay đổi ảnh Banner đầu trang và lưu lên Firebase!');
    } catch (err) {
      showError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveHeroUrl = async () => {
    if (!heroUrlInput.trim()) return;
    setIsBusy(true);
    try {
      await saveHeroImageToFirebase(heroUrlInput.trim());
      setCurrentHero(heroUrlInput.trim());
      setHeroUrlInput('');
      setFirebaseStatus('connected');
      showSuccess('Đã lưu đường link ảnh Banner lên Firebase!');
    } catch (err) {
      showError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleResetHero = async () => {
    setIsBusy(true);
    try {
      await saveHeroImageToFirebase(null);
      setCurrentHero(null);
      setFirebaseStatus('connected');
      showSuccess('Đã khôi phục ảnh Hero về mặc định!');
    } catch (err) {
      showError(err);
    } finally {
      setIsBusy(false);
    }
  };

  // 3. Warehouse / Evidence 6 photos (saved individually per slot doc in Firebase)
  const handleEvidenceUpload = async (itemId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsBusy(true);
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 960,
        maxHeight: 720,
        quality: 0.74,
        maxBase64Length: 115_000,
      });
      const updatedMap = await saveEvidenceImageToFirebase(itemId, compressed);
      setEvidenceMap(updatedMap);
      setFirebaseStatus('connected');
      showSuccess(`Đã cập nhật ảnh kho #${itemId} và đồng bộ lên Firebase!`);
    } catch (err) {
      showError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveEvidenceUrl = async (itemId: number) => {
    const url = (evidenceUrlInputs[itemId] || '').trim();
    if (!url) return;
    setIsBusy(true);
    try {
      const updatedMap = await saveEvidenceImageToFirebase(itemId, url);
      setEvidenceMap(updatedMap);
      setEvidenceUrlInputs((prev) => ({ ...prev, [itemId]: '' }));
      setFirebaseStatus('connected');
      showSuccess(`Đã lưu link ảnh kho #${itemId} lên Firebase!`);
    } catch (err) {
      showError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleResetSingleEvidence = async (itemId: number) => {
    setIsBusy(true);
    try {
      const updatedMap = await saveEvidenceImageToFirebase(itemId, null);
      setEvidenceMap(updatedMap);
      setFirebaseStatus('connected');
      showSuccess(`Đã đặt lại ảnh #${itemId} về ảnh mẫu!`);
    } catch (err) {
      showError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleResetAllEvidence = async () => {
    setIsBusy(true);
    try {
      await resetAllEvidenceImagesInFirebase();
      setEvidenceMap({});
      setFirebaseStatus('connected');
      showSuccess('Đã khôi phục tất cả ảnh kho bãi về mặc định trên Firebase!');
    } catch (err) {
      showError(err);
    } finally {
      setIsBusy(false);
    }
  };

  // Password Change Handler (inline, no prompt)
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newPassInput.trim();
    if (cleaned.length < 4) {
      setErrorMessage('Mật khẩu quản trị mới cần có ít nhất 4 ký tự.');
      return;
    }
    try {
      localStorage.setItem('kdt_admin_pass', cleaned);
      setIsEditingPass(false);
      setNewPassInput('');
      showSuccess(`Đã đổi mật khẩu quản trị thành "${cleaned}"!`);
    } catch {
      setErrorMessage('Không thể lưu mật khẩu mới trên trình duyệt này.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white text-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-600 text-white">
              <KdtLogo className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                <span>Quản Trị Logo &amp; Hình Ảnh KDT-89</span>
                {firebaseStatus === 'connected' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                    <Cloud className="w-3 h-3" /> Đã kết nối Firebase Cloud
                  </span>
                )}
                {firebaseStatus === 'checking' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang kiểm tra Firebase...
                  </span>
                )}
                {firebaseStatus === 'offline' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 inline-flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Chưa kết nối được Firebase
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tải ảnh trực tiếp từ máy/điện thoại hoặc dán URL. Mỗi khung ảnh đều lưu trực tiếp vào cơ sở dữ liệu Firebase Firestore.
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
            <span>Hướng dẫn</span>
          </button>
        </div>

        {/* Busy / Success / Error Banners */}
        {isBusy && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs font-bold text-amber-800">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            <span>Đang nén ảnh và ghi vào Firebase Firestore...</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs font-bold text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center justify-between gap-2 text-xs font-bold text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-900 underline text-[11px] shrink-0 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: THAY LOGO */}
          {activeTab === 'logo' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                <h4 className="text-sm font-bold text-orange-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Thay thế Logo công ty KDT</span>
                </h4>
                <p className="text-xs text-orange-900/90 mt-1">
                  Chọn file PNG/JPG/WEBP/SVG từ máy tính hoặc điện thoại (tự động nén gọn để đồng bộ Firebase). Logo sẽ cập nhật ngay trên Header và Footer.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                      Logo đang hiển thị:
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-xs inline-flex items-center gap-3">
                      <div className="w-14 h-14 flex items-center justify-center p-1 bg-neutral-50 rounded-lg border border-neutral-100">
                        <KdtLogo className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-orange-600">Điện Máy KDT-89</div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {currentLogo ? 'Đang dùng: Logo tùy chỉnh (Đã lưu Cloud)' : 'Đang dùng: Logo mặc định'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Tải Logo từ máy</span>
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
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Khôi phục gốc</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Paste Logo URL */}
                <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="Hoặc dán link ảnh Logo (https://...)"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!logoUrlInput.trim() || isBusy}
                    onClick={handleSaveLogoUrl}
                    className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-black disabled:opacity-40 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    Áp dụng Link Logo
                  </button>
                </div>
              </div>

              {/* Khu vực bảo mật mật khẩu admin (Inline form, không dùng prompt) */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <span>Mật khẩu bảo vệ chế độ Quản trị</span>
                    </div>
                    <p className="text-neutral-600 mt-0.5">
                      Mật khẩu mặc định: <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold font-mono">123456</code> (hoặc <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold font-mono">kdt89admin</code>).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingPass((v) => !v)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    {isEditingPass ? 'Đóng' : 'Đổi mật khẩu'}
                  </button>
                </div>

                {isEditingPass && (
                  <form onSubmit={handleSaveNewPassword} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-amber-200/80">
                    <input
                      type="text"
                      value={newPassInput}
                      onChange={(e) => setNewPassInput(e.target.value)}
                      placeholder="Nhập mật khẩu mới (ít nhất 4 ký tự)..."
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-amber-300 text-xs text-neutral-900 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer shrink-0"
                    >
                      Lưu mật khẩu mới
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: THAY ẢNH HERO */}
          {activeTab === 'hero' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200">
                <h4 className="text-sm font-bold text-neutral-900">
                  Ảnh bìa kho hàng KDT-89 ở phần đầu trang (Hero)
                </h4>
                <p className="text-xs text-neutral-600 mt-1">
                  Anh tải ảnh chụp kho thực tế, bảng hiệu công ty hoặc xe giao hàng (mọi ảnh chụp điện thoại sẽ được tự động nén nhẹ và lưu lên Firebase).
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-60 h-40 rounded-xl overflow-hidden border border-neutral-300 shrink-0 bg-neutral-900">
                    <img
                      src={currentHero || siteConfig.galleryAssets.hero}
                      alt="Hero Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="text-xs font-bold text-neutral-800">
                      Trạng thái: {currentHero ? 'Đang dùng ảnh tùy chỉnh (Đã đồng bộ Cloud)' : 'Đang dùng ảnh kho mẫu mặc định'}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Đặt lại ảnh mẫu</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Paste Hero URL */}
                <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="Hoặc dán đường link ảnh Banner (https://...)"
                      value={heroUrlInput}
                      onChange={(e) => setHeroUrlInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!heroUrlInput.trim() || isBusy}
                    onClick={handleSaveHeroUrl}
                    className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-black disabled:opacity-40 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    Áp dụng Link Ảnh
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THAY ẢNH KHO & CÔNG TRÌNH */}
          {activeTab === 'gallery' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">
                    6 Khung ảnh thực tế kho vận KDT-89
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Mỗi khung ảnh được lưu vào một document riêng trên Firebase nên tải đủ 6 ảnh vẫn mượt mà, không bị mất khi tải lại trang.
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
                {siteConfig.realEvidence.items.map((item) => {
                  const activeSrc = evidenceMap[item.id] || item.imageSrc;
                  const isCustom = Boolean(evidenceMap[item.id]);
                  const urlVal = evidenceUrlInputs[item.id] || '';
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 ${
                        isCustom ? 'border-emerald-300 bg-emerald-50/40' : 'border-neutral-200 bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-14 h-14 rounded-lg bg-neutral-200 overflow-hidden shrink-0 border border-neutral-300">
                            <img
                              src={activeSrc}
                              alt={item.caption}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-neutral-900 truncate flex items-center gap-1.5">
                              <span>#{item.id}. {item.tag}</span>
                              {isCustom && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                                  Đã lưu Cloud
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 truncate">{item.caption}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 hover:border-orange-500 hover:text-orange-600 text-neutral-700 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Đổi ảnh</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleEvidenceUpload(item.id, e)}
                              className="hidden"
                            />
                          </label>

                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => handleResetSingleEvidence(item.id)}
                              className="p-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-700 cursor-pointer"
                              title="Khôi phục ảnh mẫu mục này"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Optional paste URL per warehouse slot */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-200/70">
                        <input
                          type="url"
                          placeholder="Hoặc dán link ảnh (https://...)"
                          value={urlVal}
                          onChange={(e) =>
                            setEvidenceUrlInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          className="flex-1 px-2.5 py-1 text-[11px] rounded bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          disabled={!urlVal.trim() || isBusy}
                          onClick={() => handleSaveEvidenceUrl(item.id)}
                          className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-black disabled:opacity-40 text-white text-[11px] font-bold cursor-pointer shrink-0"
                        >
                          Lưu link
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: HƯỚNG DẪN */}
          {activeTab === 'guide' && (
            <div className="space-y-5 text-neutral-800">
              <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-orange-600 text-white shrink-0 mt-0.5">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-orange-950">
                      1. Ảnh đã đổi có đồng bộ cho khách hàng &amp; thiết bị khác không?
                    </h4>
                    <p className="text-xs text-orange-900/90 mt-1.5 leading-relaxed">
                      Có. Logo (<code className="font-mono">site_settings/media_logo</code>), Ảnh Banner (<code className="font-mono">site_settings/media_hero</code>), 6 ảnh kho (<code className="font-mono">site_settings/media_evidence_1..6</code>) và ảnh mẫu căn hộ (<code className="font-mono">site_settings/main</code>) đều lưu trên Firebase Cloud và tự đồng bộ cho mọi thiết bị.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-100 border border-neutral-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-neutral-800 text-white shrink-0 mt-0.5">
                    <FolderCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-neutral-900">
                      2. Tại sao ảnh dung lượng lớn vẫn tải lên được?
                    </h4>
                    <p className="text-xs text-neutral-700 mt-1.5 leading-relaxed">
                      Hệ thống tự động thu gọn kích thước và nén ảnh ngay trên trình duyệt trước khi gửi lên Firebase Firestore, giúp lưu trữ mượt mà không bị lỗi vượt dung lượng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-500 font-medium">
            Điện Máy KDT-89 · Đồng bộ Firebase Cloud
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
