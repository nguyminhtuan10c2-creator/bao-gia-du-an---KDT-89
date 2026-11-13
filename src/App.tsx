/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RoomVisualizerSection } from './components/RoomVisualizerSection';
import { QuoteForm } from './components/QuoteForm';
import { ProjectEstimator } from './components/ProjectEstimator';
import { CategoriesSection } from './components/CategoriesSection';
import { ProjectTypesSection } from './components/ProjectTypesSection';
import { StepsSection } from './components/StepsSection';
import { RealEvidenceSection } from './components/RealEvidenceSection';
import { CustomSectionRenderer } from './components/CustomSectionRenderer';
import { FloatingContact } from './components/FloatingContact';
import { Footer } from './components/Footer';
import { LeadsManagerModal } from './components/LeadsManagerModal';
import { AdminMediaManager } from './components/AdminMediaManager';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminContentLayoutModal } from './components/AdminContentLayoutModal';
import { AdminRoom3DModal } from './components/AdminRoom3DModal';
import { 
  subscribeToSiteSettings, 
  getLocalSiteSettings, 
  SiteSettingsData, 
  saveSiteSettingsToFirebase 
} from './services/siteContentService';
import { subscribeToMediaAssets } from './services/mediaSyncService';
import { detectLandingPresetFromUrl, LandingPresetConfig } from './utils/landingPresets';
import { trackEvent } from './utils/analytics';
import { SlidersHorizontal, Images, LogOut } from 'lucide-react';

export default function App() {
  const [landingPreset] = useState<LandingPresetConfig | null>(() => detectLandingPresetFromUrl());

  const [quoteConfig, setQuoteConfig] = useState<{
    projectType?: string;
    roomCount?: number;
    selectedItems?: string[];
    tier?: string;
    estimatedSummary?: string;
    roomArea?: number;
    occupants?: number;
  } | null>(() => {
    const preset = detectLandingPresetFromUrl();
    if (!preset) return null;
    return {
      projectType: preset.projectTypeTitle,
      roomCount: preset.defaultRoomCount,
      selectedItems: preset.defaultCategories,
    };
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>(getLocalSiteSettings);
  const [isLeadsManagerOpen, setIsLeadsManagerOpen] = useState(false);
  const [isAdminMediaOpen, setIsAdminMediaOpen] = useState(false);
  const [mediaInitialTab, setMediaInitialTab] = useState<'logo' | 'hero' | 'gallery'>('logo');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isContentLayoutOpen, setIsContentLayoutOpen] = useState(false);
  const [isAdmin3DOpen, setIsAdmin3DOpen] = useState(false);
  const [focusSectionToEdit, setFocusSectionToEdit] = useState<string>('room_visualizer');
  const [roomExpandSignal, setRoomExpandSignal] = useState(0);

  // Chế độ Quản trị:
  // - Nếu trong localStorage đã lưu kdt_admin_active = true thì đã đăng nhập
  // - Nếu URL có ?admin hoặc ?kdt=admin:
  //   + Nếu chưa lưu phiên đăng nhập => mở ngay popup mật khẩu để chủ web nhập pass
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('kdt_admin_active') === 'true';
    } catch {
      return false;
    }
  });

  // Tự động kiểm tra URL khi tải trang: nếu có ?admin thì hiện bảng nhập mật khẩu + ghi nhận page_view
  useEffect(() => {
    trackEvent('page_view', {
      landing_model: landingPreset?.id || 'default',
      path: window.location.pathname + window.location.search,
    });

    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('admin') || params.get('kdt') === 'admin') {
        const isAlreadyLoggedIn = localStorage.getItem('kdt_admin_active') === 'true';
        if (!isAlreadyLoggedIn) {
          setIsAdminLoginOpen(true);
        }
      }
    } catch {
      // ignore
    }
  }, [landingPreset]);

  // Lắng nghe cập nhật Firebase Firestore cho site_settings & media theo thời gian thực
  useEffect(() => {
    const unsubscribeSettings = subscribeToSiteSettings((newSettings) => {
      setSiteSettings(newSettings);
    });
    const unsubscribeMedia = subscribeToMediaAssets();
    return () => {
      unsubscribeSettings();
      unsubscribeMedia();
    };
  }, []);

  const handleRequestAdmin = () => {
    if (isAdmin) {
      // Nếu đang bật, bấm vào sẽ đăng xuất / ẩn chế độ quản trị
      try {
        localStorage.removeItem('kdt_admin_active');
      } catch {
        // ignore
      }
      setIsAdmin(false);
    } else {
      // Nếu chưa bật, mở popup nhập mật khẩu
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    try {
      localStorage.setItem('kdt_admin_active', 'true');
    } catch {
      // ignore
    }
    setIsAdmin(true);
    setIsAdminLoginOpen(false);
    setIsContentLayoutOpen(true);
  };

  const scrollToQuote = () => {
    const el = document.getElementById('form-bao-gia');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToEstimator = () => {
    const el = document.getElementById('du-toan');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openRoomVisualizer = () => {
    setRoomExpandSignal((n) => n + 1);
    const el = document.getElementById('setup-can-phong');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplyFromEstimator = (config: {
    projectType: string;
    roomCount: number;
    selectedItems: string[];
    tier: string;
    estimatedSummary: string;
  }) => {
    setQuoteConfig(config);
    scrollToQuote();
  };

  const handleApplyFromRoomVisualizer = (config: {
    projectType: string;
    roomCount: number;
    selectedItems: string[];
    tier: string;
    estimatedSummary: string;
    roomArea: number;
    occupants: number;
  }) => {
    setQuoteConfig(config);
    scrollToQuote();
  };

  const handleSelectCategoryForQuote = (categoryName: string) => {
    setQuoteConfig((prev) => ({
      ...prev,
      selectedItems: [categoryName],
    }));
    scrollToQuote();
  };

  const handleSelectProjectForQuote = (projectTitle: string) => {
    setQuoteConfig((prev) => ({
      ...prev,
      projectType: projectTitle,
    }));
    scrollToQuote();
  };

  const openEditSpecificSection = (sectionKey: string) => {
    setFocusSectionToEdit(sectionKey);
    setIsContentLayoutOpen(true);
  };

  const openMediaTab = (tab: 'logo' | 'hero' | 'gallery') => {
    setIsContentLayoutOpen(false);
    setMediaInitialTab(tab);
    setIsAdminMediaOpen(true);
  };

  const handleDeleteCustomSection = async (id: string) => {
    const updated = {
      ...siteSettings,
      customSections: siteSettings.customSections.filter(s => s.id !== id),
    };
    setSiteSettings(updated);
    await saveSiteSettingsToFirebase(updated);
  };

  // Render individual sections dynamically based on siteSettings configuration
  const renderSection = (sectionKey: string) => {
    const isVisible = siteSettings.sectionsVisibility[sectionKey] !== false;
    if (!isVisible) return null;

    switch (sectionKey) {
      case 'hero':
        return (
          <Hero
            key="hero"
            badge={landingPreset?.heroBadge || siteSettings.heroBadge}
            title={landingPreset?.heroHeadline || siteSettings.heroTitle}
            subtitle={landingPreset?.heroDescription || siteSettings.heroSubtitle}
            ctaPrimary={siteSettings.heroCtaPrimary}
            ctaSecondary={siteSettings.heroCtaSecondary}
            contactAddress={siteSettings.contactAddress}
            contactWorkingHours={siteSettings.contactWorkingHours}
            isAdmin={isAdmin}
            onEditSection={() => openEditSpecificSection('hero')}
            onEditHeroImage={() => openMediaTab('hero')}
            onOpenQuote={scrollToQuote}
            onOpenEstimator={scrollToEstimator}
          />
        );

      case 'room_visualizer':
        return (
          <RoomVisualizerSection
            key="room_visualizer"
            badge={siteSettings.roomSetupBadge}
            title={siteSettings.roomSetupTitle}
            subtitle={siteSettings.roomSetupSubtitle}
            toggleCtaText={siteSettings.roomToggleCtaText}
            defaultExpanded={siteSettings.roomDefaultExpanded ?? false}
            expandSignal={roomExpandSignal}
            isAdmin={isAdmin}
            roomModels={siteSettings.roomModels}
            onOpenAdmin3D={() => setIsAdmin3DOpen(true)}
            onEditSection={() => openEditSpecificSection('room_visualizer')}
            onApplyToQuote={handleApplyFromRoomVisualizer}
          />
        );

      case 'quote_form':
        return (
          <QuoteForm 
            key="quote_form"
            badge={siteSettings.quoteBadge}
            title={siteSettings.quoteTitle}
            subtitle={siteSettings.quoteSubtitle}
            customCategories={siteSettings.customCategories}
            landingModelId={landingPreset?.id}
            isAdmin={isAdmin}
            onEditSection={() => openEditSpecificSection('quote_form')}
            initialConfig={quoteConfig} 
            onOpenLeadsManager={() => setIsLeadsManagerOpen(true)}
          />
        );

      case 'project_estimator':
        return (
          <ProjectEstimator 
            key="project_estimator"
            badge={siteSettings.estimatorBadge}
            title={siteSettings.estimatorTitle}
            subtitle={siteSettings.estimatorSubtitle}
            initialProjectTypeId={landingPreset?.estimatorProjectId}
            initialRoomCount={landingPreset?.defaultRoomCount}
            initialEquipmentIds={landingPreset?.defaultEstimatorIds}
            isAdmin={isAdmin}
            onEditSection={() => openEditSpecificSection('project_estimator')}
            onApplyToQuote={handleApplyFromEstimator} 
          />
        );

      case 'categories':
        return (
          <CategoriesSection 
            key="categories"
            badge={siteSettings.categoriesBadge}
            title={siteSettings.categoriesTitle}
            subtitle={siteSettings.categoriesSubtitle}
            customCategories={siteSettings.customCategories}
            hotlineDisplay={siteSettings.hotline1Display}
            hotlineRaw={siteSettings.hotline1Raw}
            isAdmin={isAdmin}
            onEditSection={() => openEditSpecificSection('categories')}
            onSelectCategoryForQuote={handleSelectCategoryForQuote} 
          />
        );

      case 'project_types':
        return (
          <ProjectTypesSection 
            key="project_types"
            badge={siteSettings.projectTypesBadge}
            title={siteSettings.projectTypesTitle}
            subtitle={siteSettings.projectTypesSubtitle}
            customProjectTypes={siteSettings.customProjectTypes}
            isAdmin={isAdmin}
            onEditSection={() => openEditSpecificSection('project_types')}
            onSelectProjectForQuote={handleSelectProjectForQuote} 
          />
        );

      case 'steps':
        return (
          <StepsSection 
            key="steps"
            badge={siteSettings.stepsBadge}
            title={siteSettings.stepsTitle}
            subtitle={siteSettings.stepsSubtitle}
            customSteps={siteSettings.customSteps}
            hotlineDisplay={siteSettings.hotline1Display}
            hotlineRaw={siteSettings.hotline1Raw}
            isAdmin={isAdmin}
            onEditSection={() => openEditSpecificSection('steps')}
          />
        );

      case 'real_evidence':
        return (
          <RealEvidenceSection 
            key="real_evidence"
            badge={siteSettings.evidenceBadge}
            title={siteSettings.evidenceTitle}
            subtitle={siteSettings.evidenceSubtitle}
            customCaptions={siteSettings.customEvidenceCaptions}
            contactAddress={siteSettings.contactAddress}
            contactWorkingHours={siteSettings.contactWorkingHours}
            isAdmin={isAdmin}
            onEditSection={() => openEditSpecificSection('real_evidence')}
            onEditEvidenceImages={() => openMediaTab('gallery')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
      {/* 1. Header (Top Bar Contract) */}
      <Header 
        isAdmin={isAdmin}
        brandName={siteSettings.headerBrandName}
        ctaText={siteSettings.headerCtaText}
        hotline1={siteSettings.hotline1Display ? {
          label: siteSettings.hotline1Label || 'Ms. Ngọc',
          display: siteSettings.hotline1Display,
          raw: siteSettings.hotline1Raw || siteSettings.hotline1Display.replace(/\s+/g, ''),
        } : undefined}
        hotline2={siteSettings.hotline2Display ? {
          label: siteSettings.hotline2Label || 'Mr. Dũng',
          display: siteSettings.hotline2Display,
          raw: siteSettings.hotline2Raw || siteSettings.hotline2Display.replace(/\s+/g, ''),
        } : undefined}
        onOpenQuote={scrollToQuote}
        onOpenRoomVisualizer={openRoomVisualizer}
        onOpenLeadsManager={() => setIsLeadsManagerOpen(true)}
      />

      {/* Admin Floating Quick Access Bar if logged in */}
      {isAdmin && (
        <div className="sticky top-[58px] z-30 bg-neutral-950/95 text-white backdrop-blur-md px-4 py-2 border-b border-orange-500/30 flex items-center justify-between gap-2 text-xs shadow-md flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-orange-400">Chế độ Quản trị viên:</span>
            <span className="text-neutral-300 hidden md:inline">Anh có thể sửa mọi tiêu đề, ẩn/hiện các phần và dữ liệu tự đồng bộ Firebase</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAdmin3DOpen(true)}
              className="px-2.5 py-1 rounded bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 border border-orange-500/40 font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Images className="w-3.5 h-3.5" />
              <span>Ảnh Căn Hộ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFocusSectionToEdit('titles');
                setIsContentLayoutOpen(true);
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Bố Cục &amp; Tiêu Đề</span>
            </button>

            <button
              type="button"
              onClick={() => openMediaTab('logo')}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold cursor-pointer"
            >
              Logo &amp; Ảnh
            </button>

            <button
              type="button"
              onClick={handleRequestAdmin}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-red-950/70 text-neutral-300 hover:text-red-300 border border-neutral-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Thoát Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Dynamic Sections Container */}
      <main className="flex-1">
        {siteSettings.sectionsOrder.map((key) => renderSection(key))}

        {/* Custom Sections Added By Admin ("thêm bớt các phần") */}
        {siteSettings.customSections && siteSettings.customSections.map((section) => (
          <CustomSectionRenderer
            key={section.id}
            section={section}
            isAdmin={isAdmin}
            onEdit={(sec) => {
              setFocusSectionToEdit(`custom:${sec.id}`);
              setIsContentLayoutOpen(true);
            }}
            onDelete={handleDeleteCustomSection}
            onOpenQuote={scrollToQuote}
          />
        ))}
      </main>

      {/* Floating Contact Actions */}
      <FloatingContact onOpenQuote={scrollToQuote} />

      {/* Corporate Footer */}
      <Footer 
        isAdmin={isAdmin}
        brandName={siteSettings.headerBrandName}
        aboutText={siteSettings.footerAboutText}
        contactAddress={siteSettings.contactAddress}
        contactWorkingHours={siteSettings.contactWorkingHours}
        hotlines={
          siteSettings.hotline1Display && siteSettings.hotline2Display
            ? [
                {
                  label: siteSettings.hotline1Label || 'Ms. Ngọc',
                  display: siteSettings.hotline1Display,
                  raw: siteSettings.hotline1Raw || siteSettings.hotline1Display.replace(/\s+/g, ''),
                },
                {
                  label: siteSettings.hotline2Label || 'Mr. Dũng',
                  display: siteSettings.hotline2Display,
                  raw: siteSettings.hotline2Raw || siteSettings.hotline2Display.replace(/\s+/g, ''),
                },
              ]
            : undefined
        }
        onToggleAdmin={handleRequestAdmin}
        onOpenLeadsManager={() => setIsLeadsManagerOpen(true)} 
        onOpenAdminMedia={() => openMediaTab('logo')}
        onOpenContentLayout={() => {
          setFocusSectionToEdit('titles');
          setIsContentLayoutOpen(true);
        }}
      />

      {/* Leads Manager Modal & Google Sheets Sync Guide */}
      <LeadsManagerModal 
        isOpen={isLeadsManagerOpen} 
        onClose={() => setIsLeadsManagerOpen(false)} 
      />

      {/* Admin Media Manager Modal (Logo & Hình Ảnh) */}
      <AdminMediaManager
        isOpen={isAdminMediaOpen}
        initialTab={mediaInitialTab}
        onClose={() => setIsAdminMediaOpen(false)}
      />

      {/* Admin Room 3D Modal (Quản lý & Thêm mẫu căn hộ) */}
      <AdminRoom3DModal
        isOpen={isAdmin3DOpen}
        onClose={() => setIsAdmin3DOpen(false)}
        settings={siteSettings}
        onSettingsUpdated={(newSettings) => setSiteSettings(newSettings)}
      />

      {/* Admin Content & Layout Modal (Sửa tiêu đề & Thêm bớt phần) */}
      <AdminContentLayoutModal
        isOpen={isContentLayoutOpen}
        onClose={() => setIsContentLayoutOpen(false)}
        settings={siteSettings}
        focusSectionKey={focusSectionToEdit}
        onOpenMediaTab={openMediaTab}
        onSettingsUpdated={(newSettings) => setSiteSettings(newSettings)}
      />

      {/* Admin Login Password Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
