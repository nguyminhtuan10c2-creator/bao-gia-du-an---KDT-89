export type LandingModelId = 'chdv' | 'nha-tro' | 'khach-san';

export interface LandingPresetConfig {
  id: LandingModelId;
  adTitle: string;
  audienceLabel: string;
  heroBadge: string;
  heroHeadline: string;
  heroDescription: string;
  projectTypeTitle: string;
  estimatorProjectId: string;
  defaultRoomCount: number;
  defaultCategories: string[];
  defaultEstimatorIds: string[];
  queryString: string;
}

export const LANDING_PRESETS: Record<LandingModelId, LandingPresetConfig> = {
  chdv: {
    id: 'chdv',
    adTitle: 'Setup trọn bộ điện máy cho CHDV từ 5–50 phòng',
    audienceLabel: 'Chủ CHDV',
    heroBadge: 'Giải Pháp Trọn Bộ CHDV · Đại Lý Phân Phối KDT-89',
    heroHeadline: 'Setup trọn bộ điện máy cho CHDV từ 5–50 phòng',
    heroDescription:
      'Cung cấp đồng bộ máy lạnh Inverter, tủ lạnh, máy giặt, Smart TV, máy tắm nóng và bếp từ với giá theo số lượng. Hỗ trợ dự toán nhanh, giao hàng theo tiến độ hoàn thiện và xuất đầy đủ VAT.',
    projectTypeTitle: 'Căn hộ dịch vụ (CHDV)',
    estimatorProjectId: 'chdv',
    defaultRoomCount: 10,
    defaultCategories: [
      'Máy lạnh',
      'Máy tắm nóng',
      'Tủ lạnh',
      'Máy giặt',
      'TV',
      'Thiết bị gia dụng khác',
    ],
    defaultEstimatorIds: ['may-lanh', 'may-tam-nong', 'tu-lanh', 'may-giat', 'tivi'],
    queryString: '?model=chdv',
  },
  'nha-tro': {
    id: 'nha-tro',
    adTitle: 'Báo giá máy lạnh, máy tắm nóng theo dãy phòng trọ',
    audienceLabel: 'Chủ nhà trọ',
    heroBadge: 'Báo Giá Thiết Bị Nhà Trọ · Đại Lý Phân Phối KDT-89',
    heroHeadline: 'Báo giá máy lạnh, máy tắm nóng theo dãy phòng trọ',
    heroDescription:
      'Cấu hình máy lạnh Inverter bền bỉ, máy tắm nóng có chống giật ELCB và máy giặt khu chung tối ưu chi phí đầu tư phòng trọ. Giá theo số lượng phòng, giao nhận đúng tiến độ, đầy đủ VAT.',
    projectTypeTitle: 'Nhà trọ',
    estimatorProjectId: 'nha-tro',
    defaultRoomCount: 15,
    defaultCategories: ['Máy lạnh', 'Máy tắm nóng', 'Máy giặt'],
    defaultEstimatorIds: ['may-lanh', 'may-tam-nong', 'may-giat'],
    queryString: '?model=nha-tro',
  },
  'khach-san': {
    id: 'khach-san',
    adTitle: 'Cấu hình thiết bị đồng bộ cho phòng lưu trú',
    audienceLabel: 'Khách sạn / Homestay',
    heroBadge: 'Thiết Bị Phòng Lưu Trú · Đại Lý Phân Phối KDT-89',
    heroHeadline: 'Cấu hình thiết bị đồng bộ cho phòng lưu trú',
    heroDescription:
      'Giải pháp đồng bộ máy lạnh chạy êm, bình nước nóng gián tiếp, minibar 90L và Smart TV cho khách sạn mini, nhà nghỉ, homestay. Giá theo số lượng, giao theo tiến độ, bảo hành chính hãng và VAT.',
    projectTypeTitle: 'Khách sạn nhỏ & Homestay',
    estimatorProjectId: 'khach-san-nho',
    defaultRoomCount: 12,
    defaultCategories: ['Máy lạnh', 'Máy tắm nóng', 'Tủ lạnh', 'TV'],
    defaultEstimatorIds: ['may-lanh', 'may-tam-nong', 'tu-lanh', 'tivi'],
    queryString: '?model=khach-san',
  },
};

export function detectLandingPresetFromUrl(): LandingPresetConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = (
      params.get('model') ||
      params.get('lp') ||
      params.get('type') ||
      params.get('goi') ||
      ''
    )
      .trim()
      .toLowerCase();

    const hash = (window.location.hash || '').replace('#', '').toLowerCase();
    const candidate = raw || hash;

    if (!candidate) return null;
    if (candidate === 'chdv' || candidate === 'can-ho-dich-vu') return LANDING_PRESETS.chdv;
    if (candidate === 'nha-tro' || candidate === 'phong-tro' || candidate === 'tro') {
      return LANDING_PRESETS['nha-tro'];
    }
    if (
      candidate === 'khach-san' ||
      candidate === 'khach-san-nho' ||
      candidate === 'homestay' ||
      candidate === 'luu-tru'
    ) {
      return LANDING_PRESETS['khach-san'];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Synchronizes arbitrary equipment names/IDs from Estimator or RoomVisualizer
 * cleanly onto the exact QuoteForm checkbox category names (ensuring Smart TV -> TV, etc.).
 */
export function mapItemsToFormCategories(
  rawItems: string[],
  availableCategoryNames: string[] = [
    'Máy lạnh',
    'Máy tắm nóng',
    'Máy giặt',
    'Tủ lạnh',
    'TV',
    'Thiết bị gia dụng khác',
  ]
): string[] {
  const findByKeyword = (keywords: string[], fallback: string): string => {
    const matched = availableCategoryNames.find((cat) => {
      const lower = cat.toLowerCase();
      return keywords.some((kw) => lower.includes(kw));
    });
    return matched || fallback;
  };

  const result = new Set<string>();

  rawItems.forEach((raw) => {
    const lower = raw.toLowerCase().trim();
    if (!lower) return;

    // Exact match first
    const exact = availableCategoryNames.find((c) => c.toLowerCase() === lower);
    if (exact) {
      result.add(exact);
      return;
    }

    if (lower.includes('máy lạnh') || lower.includes('điều hòa') || lower.includes('may-lanh')) {
      result.add(findByKeyword(['máy lạnh', 'điều hòa'], 'Máy lạnh'));
    } else if (
      lower.includes('tắm nóng') ||
      lower.includes('nước nóng') ||
      lower.includes('bình nóng') ||
      lower.includes('may-tam-nong')
    ) {
      result.add(findByKeyword(['tắm nóng', 'nước nóng'], 'Máy tắm nóng'));
    } else if (lower.includes('máy giặt') || lower.includes('giặt') || lower.includes('may-giat')) {
      result.add(findByKeyword(['máy giặt', 'giặt'], 'Máy giặt'));
    } else if (lower.includes('tủ lạnh') || lower.includes('minibar') || lower.includes('tu-lanh')) {
      result.add(findByKeyword(['tủ lạnh'], 'Tủ lạnh'));
    } else if (
      lower === 'tv' ||
      lower.includes('smart tv') ||
      lower.includes('tivi') ||
      lower.includes('tv ')
    ) {
      result.add(findByKeyword(['tv', 'tivi'], 'TV'));
    } else if (
      lower.includes('bếp') ||
      lower.includes('hút mùi') ||
      lower.includes('gia dụng') ||
      lower.includes('gia-dung')
    ) {
      result.add(findByKeyword(['gia dụng', 'bếp'], 'Thiết bị gia dụng khác'));
    }
  });

  return Array.from(result);
}
