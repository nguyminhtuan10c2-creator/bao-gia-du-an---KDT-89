import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';
import { estimateUtf8Bytes } from '../utils/imageCompressor';
import { siteConfig } from '../config/siteConfig';

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  content: string;
  highlights?: string[];
  ctaText?: string;
  ctaLink?: string;
  isVisible?: boolean;
}

export interface RoomModelItem {
  id: string;
  name: string;
  area: number;
  occupants: number;
  roomType: string;
  imageSrc: string;
  is3dEmbed?: boolean;
  embedUrl?: string;
  description?: string;
}

export interface EditableCategoryItem {
  id: string;
  name: string;
  shortDesc: string;
  brandsHint: string;
  tag: string;
  badgeCount: string;
  featuredSpecs?: string[];
}

export interface EditableProjectTypeItem {
  id: string;
  title: string;
  audience: string;
  content: string;
  actionPrompt: string;
  keyCriteria: string;
  recommendedMix: string;
}

export interface EditableStepItem {
  step: string;
  title: string;
  desc: string;
}

export interface EditableEvidenceCaption {
  tag: string;
  caption: string;
}

export const DEFAULT_ROOM_MODELS: RoomModelItem[] = [
  {
    id: 'studio-standard',
    name: 'Căn Hộ Studio CHDV Thực Tế (20m²)',
    area: 20,
    occupants: 2,
    roomType: 'Căn hộ dịch vụ (CHDV)',
    imageSrc: '/assets/rooms/chdv_bedroom_ac_tv.jpg',
    description: 'Ảnh thực tế căn hộ studio 20m²: Máy lạnh treo tường phòng ngủ, Smart TV đối diện, bếp có tủ lạnh & máy giặt âm tủ.'
  },
  {
    id: 'can-1pn',
    name: 'Căn Hộ 1 Phòng Ngủ Rộng (30m²)',
    area: 30,
    occupants: 2,
    roomType: 'Căn hộ dịch vụ (CHDV)',
    imageSrc: '/assets/rooms/chdv_living_1pn.jpg',
    description: 'Phòng khách & bếp tách khu rộng rãi, trang bị điều hòa 2.0 HP, Smart TV 43-50 inch và tủ lạnh 2 cánh lớn.'
  },
  {
    id: 'phong-tro-gac',
    name: 'Căn Hộ Mini / Phòng Trọ Cao Cấp (16m²)',
    area: 16,
    occupants: 2,
    roomType: 'Phòng trọ cao cấp',
    imageSrc: '/assets/rooms/chdv_compact_16m2_studio.jpg',
    description: 'Bố trí khoa học cho phòng 15-17m²: Máy lạnh 1.0 HP, Smart TV 32" và tủ bếp mini gọn gàng.'
  }
];

export interface SiteSettingsData {
  headerBrandName?: string;
  headerCtaText?: string;

  contactAddress?: string;
  contactWorkingHours?: string;
  hotline1Label?: string;
  hotline1Display?: string;
  hotline1Raw?: string;
  hotline2Label?: string;
  hotline2Display?: string;
  hotline2Raw?: string;

  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaPrimary?: string;
  heroCtaSecondary?: string;
  
  roomSetupBadge?: string;
  roomSetupTitle?: string;
  roomSetupSubtitle?: string;
  roomToggleCtaText?: string;
  roomDefaultExpanded?: boolean;

  quoteBadge?: string;
  quoteTitle?: string;
  quoteSubtitle?: string;

  estimatorBadge?: string;
  estimatorTitle?: string;
  estimatorSubtitle?: string;

  categoriesBadge?: string;
  categoriesTitle?: string;
  categoriesSubtitle?: string;
  customCategories?: EditableCategoryItem[];

  projectTypesBadge?: string;
  projectTypesTitle?: string;
  projectTypesSubtitle?: string;
  customProjectTypes?: EditableProjectTypeItem[];

  stepsBadge?: string;
  stepsTitle?: string;
  stepsSubtitle?: string;
  customSteps?: EditableStepItem[];

  evidenceBadge?: string;
  evidenceTitle?: string;
  evidenceSubtitle?: string;
  customEvidenceCaptions?: Record<string, EditableEvidenceCaption>;

  footerAboutText?: string;

  sectionsVisibility: Record<string, boolean>;
  sectionsOrder: string[];
  customSections: CustomSectionItem[];
  roomModels: RoomModelItem[];
  updatedAt: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  headerBrandName: "Điện Máy KDT-89",
  headerCtaText: "Nhận Báo Giá",

  contactAddress: siteConfig.contact.address,
  contactWorkingHours: siteConfig.contact.workingHours,
  hotline1Label: siteConfig.contact.hotlines[0]?.label || "Ms. Ngọc",
  hotline1Display: siteConfig.contact.hotlines[0]?.display || "0918 064 167",
  hotline1Raw: siteConfig.contact.hotlines[0]?.raw || "0918064167",
  hotline2Label: siteConfig.contact.hotlines[1]?.label || "Mr. Dũng",
  hotline2Display: siteConfig.contact.hotlines[1]?.display || "0903 667 355",
  hotline2Raw: siteConfig.contact.hotlines[1]?.raw || "0903667355",

  heroBadge: "Kênh Phân Phối Trực Tiếp Từ Đại Lý Cấp 1",
  heroTitle: "Báo Giá Thiết Bị Điện Máy Trọn Gói Dự Án & Công Trình",
  heroSubtitle: "Cung cấp máy lạnh, máy tắm nước nóng, tủ lạnh, tivi, máy giặt giá sỉ tốt nhất TP.HCM. Hỗ trợ dự toán kỹ thuật, giao hàng tận chân công trình, đầy đủ VAT và bảo hành hãng.",
  heroCtaPrimary: "Đăng ký nhận báo giá dự án",
  heroCtaSecondary: "Tính dự toán theo số phòng",

  roomSetupBadge: "Mô Phỏng Căn Phòng Trực Quan",
  roomSetupTitle: "Setup Thiết Bị Nội Thất Chuẩn Theo Diện Tích & Số Người",
  roomSetupSubtitle: "Xem ảnh thực tế căn hộ theo số m² và số người ở. KDT-89 tự động tính toán đúng công suất máy lạnh, dung tích tủ lạnh và thiết bị tối ưu chi phí.",
  roomToggleCtaText: "Xem Hình Ảnh Căn Hộ & Setup Thiết Bị",
  roomDefaultExpanded: false,

  quoteBadge: "Phản hồi báo giá trong 30 phút",
  quoteTitle: "Đăng ký nhận báo giá thiết bị công trình",
  quoteSubtitle: "Điền nhanh số phòng hoặc danh sách thiết bị. KDT-89 sẽ gửi bảng chiết khấu đại lý tốt nhất trực tiếp qua điện thoại hoặc Zalo.",

  estimatorBadge: "Dự Toán Dự Án",
  estimatorTitle: "Công Cụ Tính Dự Toán Nhanh Theo Số Phòng",
  estimatorSubtitle: "Chọn loại hình công trình, quy mô số phòng và phân khúc thiết bị để tính toán ngân sách đầu tư ban đầu chính xác trong 3 giây.",

  categoriesBadge: "Danh Mục Thiết Bị",
  categoriesTitle: "Thiết Bị Điện Máy Chủ Lực Cho Công Trình",
  categoriesSubtitle: "100% sản phẩm chính hãng, đầy đủ CO-CQ, hóa đơn GTGT (VAT) và bảo hành kích hoạt điện tử tận nơi.",

  projectTypesBadge: "Mô Hình Chuyên Biệt",
  projectTypesTitle: "Giải Pháp Tối Ưu Cho Từng Loại Công Trình",
  projectTypesSubtitle: "Mỗi mô hình lưu trú có bài toán vận hành và mức điện năng tiêu thụ khác nhau. KDT-89 tư vấn đúng model đáp ứng tối đa hiệu suất sinh lời.",

  stepsBadge: "Quy Trình Hợp Tác",
  stepsTitle: "4 Bước Đơn Giản Để Nhận Báo Giá Dự Án",
  stepsSubtitle: "Làm việc nhanh chóng, thủ tục gọn gàng, thanh toán linh hoạt và cam kết tiến độ giao hàng đúng hẹn.",

  evidenceBadge: "Thực Tế & Minh Bạch",
  evidenceTitle: "Hình Ảnh Kho Bãi & Giao Hàng Thực Tế",
  evidenceSubtitle: "Kho hàng sẵn số lượng lớn tại TP.HCM, xe tải giao tận chân công trình mỗi ngày.",

  footerAboutText: "Kênh phân phối, tư vấn và báo giá thiết bị điện máy chính hãng cho các công trình nhà trọ, căn hộ dịch vụ (CHDV), khách sạn và dân dụng tại TP.HCM và các tỉnh lân cận.",

  sectionsVisibility: {
    hero: true,
    room_visualizer: true,
    quote_form: true,
    project_estimator: true,
    categories: true,
    project_types: true,
    steps: true,
    real_evidence: true,
  },

  sectionsOrder: [
    'hero',
    'room_visualizer',
    'quote_form',
    'project_estimator',
    'categories',
    'project_types',
    'steps',
    'real_evidence',
  ],

  customSections: [],
  roomModels: DEFAULT_ROOM_MODELS,
  updatedAt: new Date().toISOString(),
};

const LOCAL_STORAGE_KEY = 'kdt89_site_settings';

/**
 * Recursively strips `undefined` properties so Firestore setDoc() never throws
 * "Unsupported field value: undefined".
 */
function stripUndefined<T>(input: T): T {
  if (Array.isArray(input)) {
    return input
      .filter((item) => item !== undefined)
      .map((item) => stripUndefined(item)) as unknown as T;
  }
  if (input !== null && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    Object.entries(input as Record<string, unknown>).forEach(([k, v]) => {
      if (v !== undefined) {
        out[k] = stripUndefined(v);
      }
    });
    return out as T;
  }
  return input;
}

// Load initial from localStorage fallback
export function getLocalSiteSettings(): SiteSettingsData {
  if (typeof window === 'undefined') return DEFAULT_SITE_SETTINGS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        sectionsVisibility: {
          ...DEFAULT_SITE_SETTINGS.sectionsVisibility,
          ...(parsed.sectionsVisibility || {})
        },
        sectionsOrder: parsed.sectionsOrder || DEFAULT_SITE_SETTINGS.sectionsOrder,
        customSections: parsed.customSections || [],
        roomModels: (parsed.roomModels && parsed.roomModels.length > 0) ? parsed.roomModels : DEFAULT_ROOM_MODELS,
      };
    }
  } catch (err) {
    console.error('Error reading local site settings:', err);
  }
  return DEFAULT_SITE_SETTINGS;
}

// Save to both Firestore and LocalStorage
export async function saveSiteSettingsToFirebase(settings: Partial<SiteSettingsData>): Promise<SiteSettingsData> {
  const current = getLocalSiteSettings();
  const merged: SiteSettingsData = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  const updated = stripUndefined(merged);

  const byteSize = estimateUtf8Bytes(updated);
  if (byteSize > 980_000) {
    throw new Error(
      `Dữ liệu cấu hình và ảnh căn hộ đang quá nặng (${Math.round(byteSize / 1024)}KB / giới hạn 980KB của Firebase). Anh hãy xóa bớt ảnh thừa hoặc dùng ảnh nhẹ hơn / dán link ảnh URL nhé!`
    );
  }

  // Save locally first for instant snappy response
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('kdt_site_settings_updated'));
  } catch (err) {
    console.warn('LocalStorage quota warning (saving to Firebase):', err);
  }

  // Sync to Firebase Firestore
  try {
    const docRef = doc(db, 'site_settings', 'main');
    await setDoc(docRef, updated, { merge: true });
    console.log('Firebase site_settings updated successfully');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'site_settings/main');
  }

  return updated;
}

// Subscribe to real-time updates from Firebase Firestore
export function subscribeToSiteSettings(callback: (settings: SiteSettingsData) => void) {
  // Fire initial from local immediately
  callback(getLocalSiteSettings());

  try {
    const docRef = doc(db, 'site_settings', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<SiteSettingsData>;
        const merged: SiteSettingsData = {
          ...DEFAULT_SITE_SETTINGS,
          ...data,
          sectionsVisibility: {
            ...DEFAULT_SITE_SETTINGS.sectionsVisibility,
            ...(data.sectionsVisibility || {})
          },
          sectionsOrder: data.sectionsOrder || DEFAULT_SITE_SETTINGS.sectionsOrder,
          customSections: data.customSections || [],
          roomModels: (data.roomModels && data.roomModels.length > 0) ? data.roomModels : (getLocalSiteSettings().roomModels || DEFAULT_ROOM_MODELS),
        };
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
        callback(merged);
      }
    }, (error) => {
      console.warn('Site settings onSnapshot error (using local fallback):', error.message);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to listen to Firebase site_settings:', err);
    return () => {};
  }
}
