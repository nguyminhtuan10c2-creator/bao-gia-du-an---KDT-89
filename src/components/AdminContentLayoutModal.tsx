import React, { useState, useEffect } from 'react';
import { siteConfig } from '../config/siteConfig';
import {
  SiteSettingsData,
  CustomSectionItem,
  EditableCategoryItem,
  EditableProjectTypeItem,
  EditableStepItem,
  saveSiteSettingsToFirebase,
  DEFAULT_SITE_SETTINGS,
} from '../services/siteContentService';
import {
  X,
  Save,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Edit3,
  Layers,
  Type,
  Cloud,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminContentLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettingsData;
  onSettingsUpdated: (newSettings: SiteSettingsData) => void;
  focusSectionKey?: string;
  onOpenMediaTab?: (tab: 'logo' | 'hero' | 'gallery') => void;
}

export const SECTION_NAMES: Record<string, string> = {
  hero: '1. Đầu trang & Banner chính (Hero)',
  room_visualizer: '2. Setup căn phòng theo m² & người ở',
  quote_form: '3. Form Đăng ký nhận báo giá',
  project_estimator: '4. Công cụ tính dự toán nhanh theo phòng',
  categories: '5. Danh mục thiết bị điện máy chủ lực',
  project_types: '6. Giải pháp theo mô hình công trình',
  steps: '7. Quy trình 4 bước nhận báo giá',
  real_evidence: '8. Hình ảnh kho bãi & giao hàng thực tế',
};

export const AdminContentLayoutModal: React.FC<AdminContentLayoutModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsUpdated,
  focusSectionKey,
  onOpenMediaTab,
}) => {
  const [activeTab, setActiveTab] = useState<'titles' | 'sections' | 'add_custom'>('titles');
  const [formData, setFormData] = useState<SiteSettingsData>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [selectedSectionToEdit, setSelectedSectionToEdit] = useState<string>('room_visualizer');
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);

  // Custom section draft form
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomSubtitle, setNewCustomSubtitle] = useState('');
  const [newCustomBadge, setNewCustomBadge] = useState('Ưu Đãi Đặc Biệt');
  const [newCustomContent, setNewCustomContent] = useState('');
  const [newCustomHighlights, setNewCustomHighlights] = useState('');
  const [newCustomCta, setNewCustomCta] = useState('Nhận Báo Giá Ngay');

  useEffect(() => {
    if (!isOpen) return;
    setFormData(settings);
    setErrorMessage(null);
    setConfirmReset(false);
    setEditingCustomId(null);

    if (focusSectionKey?.startsWith('custom:')) {
      const targetId = focusSectionKey.replace('custom:', '');
      setActiveTab('sections');
      setEditingCustomId(targetId);
    } else if (focusSectionKey === 'sections') {
      setActiveTab('sections');
    } else if (focusSectionKey && focusSectionKey !== 'titles') {
      setSelectedSectionToEdit(focusSectionKey);
      setActiveTab('titles');
    } else if (focusSectionKey === 'titles') {
      setActiveTab('titles');
    }
  }, [isOpen, settings, focusSectionKey]);

  if (!isOpen) return null;

  const handleTextChange = (key: keyof SiteSettingsData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBooleanChange = (key: keyof SiteSettingsData, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleToggleSection = (sectionKey: string) => {
    setFormData((prev) => ({
      ...prev,
      sectionsVisibility: {
        ...prev.sectionsVisibility,
        [sectionKey]: prev.sectionsVisibility[sectionKey] === false,
      },
    }));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...formData.sectionsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setFormData((prev) => ({
      ...prev,
      sectionsOrder: newOrder,
    }));
  };

  const handleAddCustomSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTitle.trim()) return;

    const highlightsList = newCustomHighlights
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newSection: CustomSectionItem = {
      id: `custom_${Date.now()}`,
      title: newCustomTitle.trim(),
      subtitle: newCustomSubtitle.trim(),
      badge: newCustomBadge.trim(),
      content: newCustomContent.trim(),
      highlights: highlightsList,
      ctaText: newCustomCta.trim(),
      ctaLink: '#form-bao-gia',
      isVisible: true,
    };

    setFormData((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newSection],
    }));

    setNewCustomTitle('');
    setNewCustomSubtitle('');
    setNewCustomContent('');
    setNewCustomHighlights('');
    setActiveTab('sections');
  };

  const handleUpdateCustomSectionField = <K extends keyof CustomSectionItem>(
    id: string,
    field: K,
    value: CustomSectionItem[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleToggleCustomSectionVisibility = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === id ? { ...s, isVisible: s.isVisible === false } : s
      ),
    }));
  };

  const handleDeleteCustomSection = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((s) => s.id !== id),
    }));
    if (editingCustomId === id) setEditingCustomId(null);
  };

  // Helpers to edit cards in Categories / ProjectTypes / Steps / Evidence
  const effectiveCategories: EditableCategoryItem[] =
    formData.customCategories && formData.customCategories.length > 0
      ? formData.customCategories
      : siteConfig.categories.map((c) => ({
          id: c.id,
          name: c.name,
          shortDesc: c.shortDesc,
          brandsHint: c.brandsHint,
          tag: c.tag,
          badgeCount: c.badgeCount,
          featuredSpecs: c.featuredSpecs,
        }));

  const handleCategoryFieldChange = (
    idx: number,
    field: keyof EditableCategoryItem,
    value: string
  ) => {
    const next = [...effectiveCategories];
    next[idx] = { ...next[idx], [field]: value };
    setFormData((prev) => ({ ...prev, customCategories: next }));
  };

  const effectiveProjectTypes: EditableProjectTypeItem[] =
    formData.customProjectTypes && formData.customProjectTypes.length > 0
      ? formData.customProjectTypes
      : siteConfig.projectTypes.map((p) => ({
          id: p.id,
          title: p.title,
          audience: p.audience,
          content: p.content,
          actionPrompt: p.actionPrompt,
          keyCriteria: p.keyCriteria,
          recommendedMix: p.recommendedMix,
        }));

  const handleProjectTypeFieldChange = (
    idx: number,
    field: keyof EditableProjectTypeItem,
    value: string
  ) => {
    const next = [...effectiveProjectTypes];
    next[idx] = { ...next[idx], [field]: value };
    setFormData((prev) => ({ ...prev, customProjectTypes: next }));
  };

  const effectiveSteps: EditableStepItem[] =
    formData.customSteps && formData.customSteps.length > 0
      ? formData.customSteps
      : siteConfig.steps.map((s) => ({
          step: s.step,
          title: s.title,
          desc: s.desc,
        }));

  const handleStepFieldChange = (
    idx: number,
    field: keyof EditableStepItem,
    value: string
  ) => {
    const next = [...effectiveSteps];
    next[idx] = { ...next[idx], [field]: value };
    setFormData((prev) => ({ ...prev, customSteps: next }));
  };

  const handleEvidenceCaptionChange = (
    itemId: number,
    field: 'tag' | 'caption',
    value: string
  ) => {
    const baseItem = siteConfig.realEvidence.items.find((i) => i.id === itemId);
    const currentMap = formData.customEvidenceCaptions || {};
    const existing = currentMap[String(itemId)] || {
      tag: baseItem?.tag || '',
      caption: baseItem?.caption || '',
    };
    setFormData((prev) => ({
      ...prev,
      customEvidenceCaptions: {
        ...currentMap,
        [String(itemId)]: {
          ...existing,
          [field]: value,
        },
      },
    }));
  };

  const handleSaveToFirebase = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const updated = await saveSiteSettingsToFirebase(formData);
      onSettingsUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving settings to Firebase:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Không thể lưu lên Firebase, vui lòng kiểm tra kết nối mạng!'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmResetDefaults = () => {
    setFormData(DEFAULT_SITE_SETTINGS);
    setConfirmReset(false);
    setErrorMessage(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-900 text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-750"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-600/30 text-orange-400 border border-orange-500/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                <span>Quản Lý Nội Dung Chữ &amp; Bố Cục Website</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Firebase Đồng Bộ
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tự do sửa chữ mọi phần, sửa thông tin liên hệ, ẩn/hiện hoặc sắp xếp bố cục rồi bấm "Lưu &amp; Đồng Bộ Firebase".
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-800 bg-neutral-925 px-4 gap-2 text-xs font-bold overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('titles')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'titles'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Sửa Nội Dung Chữ Từng Phần</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sections'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Bật / Tắt &amp; Thứ Tự Các Phần</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add_custom')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'add_custom'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Phần Nội Dung Mới</span>
          </button>
        </div>

        {/* Inline Error Notification */}
        {errorMessage && (
          <div className="px-5 py-2.5 bg-red-950/80 border-b border-red-500/40 text-xs text-red-200 font-semibold flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-300 hover:text-white underline text-[11px] shrink-0 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: SỬA CHỮ TỪNG PHẦN */}
          {activeTab === 'titles' && (
            <div className="space-y-6">
              {/* Selector for which section to edit */}
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider shrink-0">
                  Chọn phần muốn sửa:
                </span>
                <select
                  value={selectedSectionToEdit}
                  onChange={(e) => setSelectedSectionToEdit(e.target.value)}
                  className="w-full sm:flex-1 max-w-md px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-900 border border-neutral-700 text-orange-400 focus:outline-none"
                >
                  <option value="global">0. Thương Hiệu, Hotline, Địa Chỉ, Nút Bấm &amp; Footer</option>
                  <option value="hero">1. Đầu Trang &amp; Banner Hero</option>
                  <option value="room_visualizer">2. Setup Căn Phòng Trực Quan (Ẩn / Mở Trượt Xuống)</option>
                  <option value="quote_form">3. Form Báo Giá Công Trình</option>
                  <option value="project_estimator">4. Dự Toán Nhanh Theo Phòng</option>
                  <option value="categories">5. Danh Mục Thiết Bị (Tiêu đề &amp; 6 Thẻ sản phẩm)</option>
                  <option value="project_types">6. Giải Pháp Theo Mô Hình (Tiêu đề &amp; 4 Mô hình)</option>
                  <option value="steps">7. Quy Trình 4 Bước (Tiêu đề &amp; 4 Bước)</option>
                  <option value="real_evidence">8. Kho Bãi &amp; Giao Hàng (Tiêu đề &amp; 6 Chú thích ảnh)</option>
                </select>
              </div>

              {/* SECTION 0: Global Header, Contact, CTA & Footer */}
              {selectedSectionToEdit === 'global' && (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800 flex-wrap gap-2">
                    <span className="text-sm font-bold text-orange-400">
                      Phần Chung: Thương Hiệu, Liên Hệ, Nút Bấm &amp; Footer
                    </span>
                    {onOpenMediaTab && (
                      <button
                        type="button"
                        onClick={() => onOpenMediaTab('logo')}
                        className="px-2.5 py-1 rounded-lg bg-orange-600/20 hover:bg-orange-600/35 text-orange-300 border border-orange-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Đổi Ảnh Logo</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Tên thương hiệu (Header &amp; Footer):
                      </label>
                      <input
                        type="text"
                        value={formData.headerBrandName || ''}
                        onChange={(e) => handleTextChange('headerBrandName', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Chữ nút bấm trên thanh Header:
                      </label>
                      <input
                        type="text"
                        value={formData.headerCtaText || ''}
                        onChange={(e) => handleTextChange('headerCtaText', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Tên Hotline 1:
                      </label>
                      <input
                        type="text"
                        value={formData.hotline1Label || ''}
                        onChange={(e) => handleTextChange('hotline1Label', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Số điện thoại Hotline 1:
                      </label>
                      <input
                        type="text"
                        value={formData.hotline1Display || ''}
                        onChange={(e) => {
                          handleTextChange('hotline1Display', e.target.value);
                          handleTextChange('hotline1Raw', e.target.value.replace(/\s+/g, ''));
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Tên Hotline 2:
                      </label>
                      <input
                        type="text"
                        value={formData.hotline2Label || ''}
                        onChange={(e) => handleTextChange('hotline2Label', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Số điện thoại Hotline 2:
                      </label>
                      <input
                        type="text"
                        value={formData.hotline2Display || ''}
                        onChange={(e) => {
                          handleTextChange('hotline2Display', e.target.value);
                          handleTextChange('hotline2Raw', e.target.value.replace(/\s+/g, ''));
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Địa chỉ kho hàng:
                      </label>
                      <input
                        type="text"
                        value={formData.contactAddress || ''}
                        onChange={(e) => handleTextChange('contactAddress', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Giờ làm việc:
                      </label>
                      <input
                        type="text"
                        value={formData.contactWorkingHours || ''}
                        onChange={(e) => handleTextChange('contactWorkingHours', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Đoạn giới thiệu ở Chân Trang (Footer):
                    </label>
                    <textarea
                      rows={3}
                      value={formData.footerAboutText || ''}
                      onChange={(e) => handleTextChange('footerAboutText', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 1: Hero */}
              {selectedSectionToEdit === 'hero' && (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800 flex-wrap gap-2">
                    <span className="text-sm font-bold text-orange-400">
                      Phần: Banner Đầu Trang (Hero)
                    </span>
                    {onOpenMediaTab && (
                      <button
                        type="button"
                        onClick={() => onOpenMediaTab('hero')}
                        className="px-2.5 py-1 rounded-lg bg-orange-600/20 hover:bg-orange-600/35 text-orange-300 border border-orange-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Đổi Ảnh Banner Hero</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Huy hiệu đầu trang:
                    </label>
                    <input
                      type="text"
                      value={formData.heroBadge || ''}
                      onChange={(e) => handleTextChange('heroBadge', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Tiêu đề chính Hero (H1):
                    </label>
                    <input
                      type="text"
                      value={formData.heroTitle || ''}
                      onChange={(e) => handleTextChange('heroTitle', e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Phụ đề giới thiệu:
                    </label>
                    <textarea
                      rows={3}
                      value={formData.heroSubtitle || ''}
                      onChange={(e) => handleTextChange('heroSubtitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Chữ nút chính màu cam:
                      </label>
                      <input
                        type="text"
                        value={formData.heroCtaPrimary || ''}
                        onChange={(e) => handleTextChange('heroCtaPrimary', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Chữ nút phụ bên cạnh:
                      </label>
                      <input
                        type="text"
                        value={formData.heroCtaSecondary || ''}
                        onChange={(e) => handleTextChange('heroCtaSecondary', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: Setup Căn Phòng */}
              {selectedSectionToEdit === 'room_visualizer' && (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="text-sm font-bold text-orange-400 pb-2 border-b border-neutral-800">
                    Phần: Setup Căn Phòng Theo Diện Tích &amp; Số Người
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Huy hiệu / Badge nhỏ:
                    </label>
                    <input
                      type="text"
                      value={formData.roomSetupBadge || ''}
                      onChange={(e) => handleTextChange('roomSetupBadge', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Tiêu đề chính (H2):
                    </label>
                    <input
                      type="text"
                      value={formData.roomSetupTitle || ''}
                      onChange={(e) => handleTextChange('roomSetupTitle', e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Mô tả / Phụ đề giải thích:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.roomSetupSubtitle || ''}
                      onChange={(e) => handleTextChange('roomSetupSubtitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Chữ nút bấm để mở xem ảnh căn hộ:
                      </label>
                      <input
                        type="text"
                        value={formData.roomToggleCtaText || ''}
                        onChange={(e) => handleTextChange('roomToggleCtaText', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <label className="flex items-center gap-2.5 text-xs text-neutral-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.roomDefaultExpanded === true}
                        onChange={(e) => handleBooleanChange('roomDefaultExpanded', e.target.checked)}
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                      />
                      <span>Mở sẵn hình ảnh ngay khi vào trang (bỏ chọn = ẩn gọn, bấm mới trượt xuống)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION 3: Quote Form */}
              {selectedSectionToEdit === 'quote_form' && (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="text-sm font-bold text-orange-400 pb-2 border-b border-neutral-800">
                    Phần: Đăng Ký Nhận Báo Giá
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Huy hiệu / Nhãn thời gian phản hồi:
                    </label>
                    <input
                      type="text"
                      value={formData.quoteBadge || ''}
                      onChange={(e) => handleTextChange('quoteBadge', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Tiêu đề Form báo giá:
                    </label>
                    <input
                      type="text"
                      value={formData.quoteTitle || ''}
                      onChange={(e) => handleTextChange('quoteTitle', e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Phụ đề hướng dẫn:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.quoteSubtitle || ''}
                      onChange={(e) => handleTextChange('quoteSubtitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 4: Estimator */}
              {selectedSectionToEdit === 'project_estimator' && (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="text-sm font-bold text-orange-400 pb-2 border-b border-neutral-800">
                    Phần: Tính Dự Toán Nhanh Theo Số Phòng
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Huy hiệu / Badge nhỏ:
                    </label>
                    <input
                      type="text"
                      value={formData.estimatorBadge || ''}
                      onChange={(e) => handleTextChange('estimatorBadge', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Tiêu đề Dự Toán:
                    </label>
                    <input
                      type="text"
                      value={formData.estimatorTitle || ''}
                      onChange={(e) => handleTextChange('estimatorTitle', e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Mô tả phụ:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.estimatorSubtitle || ''}
                      onChange={(e) => handleTextChange('estimatorSubtitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 5: Categories + 6 Editable Category Cards */}
              {selectedSectionToEdit === 'categories' && (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="text-sm font-bold text-orange-400 pb-2 border-b border-neutral-800">
                    Phần: Danh Mục Thiết Bị Chủ Lực (Tiêu đề &amp; 6 Nhóm Sản Phẩm)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Huy hiệu / Badge nhỏ:
                      </label>
                      <input
                        type="text"
                        value={formData.categoriesBadge || ''}
                        onChange={(e) => handleTextChange('categoriesBadge', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Tiêu đề Danh Mục:
                      </label>
                      <input
                        type="text"
                        value={formData.categoriesTitle || ''}
                        onChange={(e) => handleTextChange('categoriesTitle', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Phụ đề cam kết:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.categoriesSubtitle || ''}
                      onChange={(e) => handleTextChange('categoriesSubtitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-neutral-800 space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Nội dung chữ 6 thẻ thiết bị:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {effectiveCategories.map((cat, idx) => (
                        <div key={cat.id} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={cat.name}
                              onChange={(e) => handleCategoryFieldChange(idx, 'name', e.target.value)}
                              placeholder="Tên nhóm"
                              className="px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-white font-bold focus:outline-none focus:border-orange-500"
                            />
                            <input
                              type="text"
                              value={cat.badgeCount}
                              onChange={(e) => handleCategoryFieldChange(idx, 'badgeCount', e.target.value)}
                              placeholder="Công suất / Quy cách"
                              className="px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-orange-300 focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={cat.shortDesc}
                            onChange={(e) => handleCategoryFieldChange(idx, 'shortDesc', e.target.value)}
                            placeholder="Mô tả nhóm thiết bị"
                            className="w-full px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                          />
                          <input
                            type="text"
                            value={cat.brandsHint}
                            onChange={(e) => handleCategoryFieldChange(idx, 'brandsHint', e.target.value)}
                            placeholder="Thương hiệu tiêu biểu"
                            className="w-full px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-neutral-400 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: Project Types + 4 Editable Cards */}
              {selectedSectionToEdit === 'project_types' && (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="text-sm font-bold text-orange-400 pb-2 border-b border-neutral-800">
                    Phần: Mô Hình &amp; Giải Pháp Công Trình
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Huy hiệu / Badge nhỏ:
                      </label>
                      <input
                        type="text"
                        value={formData.projectTypesBadge || ''}
                        onChange={(e) => handleTextChange('projectTypesBadge', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Tiêu đề Mô hình:
                      </label>
                      <input
                        type="text"
                        value={formData.projectTypesTitle || ''}
                        onChange={(e) => handleTextChange('projectTypesTitle', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Phụ đề:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.projectTypesSubtitle || ''}
                      onChange={(e) => handleTextChange('projectTypesSubtitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-neutral-800 space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Nội dung chữ 4 mô hình công trình:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {effectiveProjectTypes.map((proj, idx) => (
                        <div key={proj.id} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => handleProjectTypeFieldChange(idx, 'title', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-white font-bold focus:outline-none focus:border-orange-500"
                          />
                          <input
                            type="text"
                            value={proj.audience}
                            onChange={(e) => handleProjectTypeFieldChange(idx, 'audience', e.target.value)}
                            placeholder="Đối tượng"
                            className="w-full px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-neutral-400 focus:outline-none focus:border-orange-500"
                          />
                          <textarea
                            rows={2}
                            value={proj.content}
                            onChange={(e) => handleProjectTypeFieldChange(idx, 'content', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: Steps + 4 Editable Steps */}
              {selectedSectionToEdit === 'steps' && (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="text-sm font-bold text-orange-400 pb-2 border-b border-neutral-800">
                    Phần: Quy Trình 4 Bước
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Huy hiệu / Badge nhỏ:
                      </label>
                      <input
                        type="text"
                        value={formData.stepsBadge || ''}
                        onChange={(e) => handleTextChange('stepsBadge', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Tiêu đề Quy trình:
                      </label>
                      <input
                        type="text"
                        value={formData.stepsTitle || ''}
                        onChange={(e) => handleTextChange('stepsTitle', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Phụ đề:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.stepsSubtitle || ''}
                      onChange={(e) => handleTextChange('stepsSubtitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-neutral-800 space-y-2.5">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Nội dung 4 bước:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {effectiveSteps.map((st, idx) => (
                        <div key={st.step} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                          <div className="text-[11px] font-bold text-orange-400">Bước {st.step}</div>
                          <input
                            type="text"
                            value={st.title}
                            onChange={(e) => handleStepFieldChange(idx, 'title', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-white font-bold focus:outline-none focus:border-orange-500"
                          />
                          <textarea
                            rows={2}
                            value={st.desc}
                            onChange={(e) => handleStepFieldChange(idx, 'desc', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 8: Real Evidence + 6 Editable Captions */}
              {selectedSectionToEdit === 'real_evidence' && (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800 flex-wrap gap-2">
                    <span className="text-sm font-bold text-orange-400">
                      Phần: Kho Hàng &amp; Hình Ảnh Thực Tế
                    </span>
                    {onOpenMediaTab && (
                      <button
                        type="button"
                        onClick={() => onOpenMediaTab('gallery')}
                        className="px-2.5 py-1 rounded-lg bg-orange-600/20 hover:bg-orange-600/35 text-orange-300 border border-orange-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Đổi 6 Ảnh Kho Bãi</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Huy hiệu / Badge nhỏ:
                      </label>
                      <input
                        type="text"
                        value={formData.evidenceBadge || ''}
                        onChange={(e) => handleTextChange('evidenceBadge', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Tiêu đề Kho bãi:
                      </label>
                      <input
                        type="text"
                        value={formData.evidenceTitle || ''}
                        onChange={(e) => handleTextChange('evidenceTitle', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Phụ đề:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.evidenceSubtitle || ''}
                      onChange={(e) => handleTextChange('evidenceSubtitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-neutral-800 space-y-2.5">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Chú thích 6 khung ảnh kho vận:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {siteConfig.realEvidence.items.map((item) => {
                        const override = formData.customEvidenceCaptions?.[String(item.id)];
                        const currentTag = override?.tag ?? item.tag;
                        const currentCaption = override?.caption ?? item.caption;
                        return (
                          <div key={item.id} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                            <div className="text-[11px] font-bold text-orange-400">Ảnh #{item.id}</div>
                            <input
                              type="text"
                              value={currentTag}
                              onChange={(e) => handleEvidenceCaptionChange(item.id, 'tag', e.target.value)}
                              placeholder="Nhãn góc ảnh"
                              className="w-full px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-white font-semibold focus:outline-none focus:border-orange-500"
                            />
                            <input
                              type="text"
                              value={currentCaption}
                              onChange={(e) => handleEvidenceCaptionChange(item.id, 'caption', e.target.value)}
                              placeholder="Chú thích dưới ảnh"
                              className="w-full px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BẬT / TẮT & THỨ TỰ CÁC PHẦN */}
          {activeTab === 'sections' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  Anh có thể <strong>Bật / Tắt (Ẩn / Hiện)</strong> bất kỳ phần nào trên trang web, bấm <strong>Sửa chữ</strong> để chỉnh nội dung, hoặc bấm mũi tên <strong>Lên / Xuống</strong> để sắp xếp thứ tự. Nhớ bấm <strong>Lưu &amp; Đồng Bộ Firebase</strong> bên dưới!
                </span>
              </div>

              <div className="space-y-2">
                {formData.sectionsOrder.map((key, index) => {
                  const isVisible = formData.sectionsVisibility[key] !== false;
                  const name = SECTION_NAMES[key] || `Phần: ${key}`;

                  return (
                    <div
                      key={key}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isVisible
                          ? 'bg-neutral-950 border-neutral-800'
                          : 'bg-neutral-950/40 border-neutral-850 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-neutral-850 text-neutral-400 flex items-center justify-center font-mono text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <span className={`text-sm font-bold block ${isVisible ? 'text-white' : 'text-neutral-500'}`}>
                            {name}
                          </span>
                          <span className="text-[11px] text-neutral-400 block">
                            Mã: <code className="text-orange-400/80">{key}</code>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSectionToEdit(key);
                            setActiveTab('titles');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Sửa chữ phần này"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sửa chữ</span>
                        </button>

                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSection(index, 'up')}
                          className="p-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 cursor-pointer"
                          title="Di chuyển lên trên"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          disabled={index === formData.sectionsOrder.length - 1}
                          onClick={() => handleMoveSection(index, 'down')}
                          className="p-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 cursor-pointer"
                          title="Di chuyển xuống dưới"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleSection(key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isVisible
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                              : 'bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30'
                          }`}
                        >
                          {isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Đang Hiện</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Đã Ẩn</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom sections listing with Inline Edit & Visibility Toggle */}
              {formData.customSections.length > 0 && (
                <div className="pt-4 border-t border-neutral-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Các khối nội dung tùy chỉnh anh đã tạo ({formData.customSections.length}):
                  </h4>

                  <div className="space-y-3">
                    {formData.customSections.map((item) => {
                      const isCustomVisible = item.isVisible !== false;
                      const isEditing = editingCustomId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl bg-neutral-950 border border-amber-500/20 space-y-3 ${
                            !isCustomVisible ? 'opacity-65' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                                  {item.badge || 'Khối tùy chỉnh'}
                                </span>
                                <span className="text-sm font-bold text-white truncate">{item.title}</span>
                              </div>
                              {item.subtitle && (
                                <p className="text-xs text-neutral-400 mt-1 truncate max-w-md">{item.subtitle}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setEditingCustomId(isEditing ? null : item.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                                  isEditing
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-neutral-850 hover:bg-neutral-800 text-amber-300'
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{isEditing ? 'Đóng sửa' : 'Sửa chữ'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleCustomSectionVisibility(item.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isCustomVisible
                                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                                    : 'bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30'
                                }`}
                              >
                                {isCustomVisible ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Đang Hiện</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5" />
                                    <span>Đã Ẩn</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteCustomSection(item.id)}
                                className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 transition-colors cursor-pointer"
                                title="Xóa phần này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Inline Custom Section Editor */}
                          {isEditing && (
                            <div className="pt-3 border-t border-neutral-800 space-y-3 text-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-neutral-400 mb-1">Tiêu đề:</label>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleUpdateCustomSectionField(item.id, 'title', e.target.value)}
                                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-neutral-400 mb-1">Huy hiệu (Badge):</label>
                                  <input
                                    type="text"
                                    value={item.badge || ''}
                                    onChange={(e) => handleUpdateCustomSectionField(item.id, 'badge', e.target.value)}
                                    className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-neutral-400 mb-1">Phụ đề:</label>
                                <input
                                  type="text"
                                  value={item.subtitle || ''}
                                  onChange={(e) => handleUpdateCustomSectionField(item.id, 'subtitle', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-neutral-400 mb-1">Nội dung chi tiết:</label>
                                <textarea
                                  rows={3}
                                  value={item.content || ''}
                                  onChange={(e) => handleUpdateCustomSectionField(item.id, 'content', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-200"
                                />
                              </div>
                              <div>
                                <label className="block text-neutral-400 mb-1">Chữ trên nút CTA:</label>
                                <input
                                  type="text"
                                  value={item.ctaText || ''}
                                  onChange={(e) => handleUpdateCustomSectionField(item.id, 'ctaText', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: THÊM KHỐI NỘI DUNG TÙY CHỈNH MỚI */}
          {activeTab === 'add_custom' && (
            <form onSubmit={handleAddCustomSection} className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-300">
                Thêm một phần nội dung mới vào website (ví dụ: Chính sách chiết khấu nhà thầu, Cam kết tiến độ, Chương trình ưu đãi...).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Tiêu đề phần mới <span className="text-red-400">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Chính Sách Chiết Khấu Đặc Biệt Dành Cho Nhà Thầu"
                    value={newCustomTitle}
                    onChange={(e) => setNewCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Huy hiệu nhỏ trên đầu (Badge):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Chiết Khấu Đại Lý Cấp 1"
                    value={newCustomBadge}
                    onChange={(e) => setNewCustomBadge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Phụ đề giới thiệu:
                </label>
                <input
                  type="text"
                  placeholder="VD: Cam kết hỗ trợ công nợ linh hoạt, chiết khấu lũy tiến theo số phòng hoàn thiện."
                  value={newCustomSubtitle}
                  onChange={(e) => setNewCustomSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nội dung chi tiết (đoạn văn bản):
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung bài viết hoặc thông điệp gửi tới đối tác và khách hàng..."
                  value={newCustomContent}
                  onChange={(e) => setNewCustomContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Các gạch đầu dòng nổi bật (mỗi ý 1 dòng):
                </label>
                <textarea
                  rows={3}
                  placeholder="Hỗ trợ kỹ thuật khảo sát đường ống đồng tận nơi&#10;Đổi trả 1-1 trong 30 ngày nếu có lỗi của nhà sản xuất&#10;Xuất hóa đơn điện tử VAT ngay khi giao hàng"
                  value={newCustomHighlights}
                  onChange={(e) => setNewCustomHighlights(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Chữ trên nút bấm (CTA):
                  </label>
                  <input
                    type="text"
                    value={newCustomCta}
                    onChange={(e) => setNewCustomCta(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Khối Nội Dung Này Vào Website</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer with Save Buttons */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-neutral-400 hover:text-neutral-200 underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục giao diện gốc</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-300">Khôi phục tiêu đề mặc định?</span>
                <button
                  type="button"
                  onClick={handleConfirmResetDefaults}
                  className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Đã lưu thành công lên Firebase!
              </span>
            )}

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveToFirebase}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu Cloud...' : 'Lưu & Đồng Bộ Firebase'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
