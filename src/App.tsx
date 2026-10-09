/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuoteForm } from './components/QuoteForm';
import { ProjectEstimator } from './components/ProjectEstimator';
import { CategoriesSection } from './components/CategoriesSection';
import { ProjectTypesSection } from './components/ProjectTypesSection';
import { StepsSection } from './components/StepsSection';
import { RealEvidenceSection } from './components/RealEvidenceSection';
import { FloatingContact } from './components/FloatingContact';
import { Footer } from './components/Footer';
import { LeadsManagerModal } from './components/LeadsManagerModal';
import { AdminMediaManager } from './components/AdminMediaManager';

export default function App() {
  const [quoteConfig, setQuoteConfig] = useState<{
    projectType?: string;
    roomCount?: number;
    selectedItems?: string[];
    tier?: string;
    estimatedSummary?: string;
  } | null>(null);

  const [isLeadsManagerOpen, setIsLeadsManagerOpen] = useState(false);
  const [isAdminMediaOpen, setIsAdminMediaOpen] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-amber-100 selection:text-amber-900">
      {/* 1. Header (Top Bar Contract) */}
      <Header 
        onOpenQuote={scrollToQuote} 
        onOpenLeadsManager={() => setIsLeadsManagerOpen(true)}
      />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero
          onOpenQuote={scrollToQuote}
          onOpenEstimator={scrollToEstimator}
        />

        {/* 3. ĐĂNG KÝ BÁO GIÁ CÔNG TRÌNH - ĐƯỢC ĐƯA LÊN ĐẦU TRANG */}
        <QuoteForm 
          initialConfig={quoteConfig} 
          onOpenLeadsManager={() => setIsLeadsManagerOpen(true)}
        />

        {/* 4. Công Cụ Tính Dự Toán Nhanh Theo Số Phòng */}
        <ProjectEstimator onApplyToQuote={handleApplyFromEstimator} />

        {/* 5. Danh Mục Thiết Bị Chủ Lực */}
        <CategoriesSection onSelectCategoryForQuote={handleSelectCategoryForQuote} />

        {/* 6. Mô Hình & Giải Pháp Công Trình */}
        <ProjectTypesSection onSelectProjectForQuote={handleSelectProjectForQuote} />

        {/* 7. Quy Trình 4 Bước */}
        <StepsSection />

        {/* 8. Hình Ảnh Kho Bãi & Giao Hàng Thực Tế */}
        <RealEvidenceSection />
      </main>

      {/* 9. Floating Contact Actions */}
      <FloatingContact onOpenQuote={scrollToQuote} />

      {/* 10. Corporate Footer */}
      <Footer 
        onOpenLeadsManager={() => setIsLeadsManagerOpen(true)} 
        onOpenAdminMedia={() => setIsAdminMediaOpen(true)}
      />

      {/* 11. Leads Manager Modal & Google Sheets Sync Guide */}
      <LeadsManagerModal 
        isOpen={isLeadsManagerOpen} 
        onClose={() => setIsLeadsManagerOpen(false)} 
      />

      {/* 12. Admin Media Manager Modal (Logo & Hình Ảnh) */}
      <AdminMediaManager
        isOpen={isAdminMediaOpen}
        onClose={() => setIsAdminMediaOpen(false)}
      />
    </div>
  );
}
