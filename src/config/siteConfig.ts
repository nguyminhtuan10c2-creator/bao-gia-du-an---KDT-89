// Cấu hình URL nhận dữ liệu Form (thay bằng Google Apps Script, Google Form hoặc Webhook)
export const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbz1QT8XUN1CoBYuHFJ26p6TRcxz3Mlru9ncyE_3kw4mPHc5pJWc_1p9eBNbTfBo6-ZP/exec";

// Import generated realistic visual assets
import heroImage from '@/src/assets/images/hero_kdt89_appliances_1791306546124.jpg';
import warehouseImage from '@/src/assets/images/warehouse_ac_inventory_1791306564926.jpg';
import deliveryImage from '@/src/assets/images/project_delivery_logistics_1791306580107.jpg';
import installationImage from '@/src/assets/images/technician_installation_handover_1791306592350.jpg';

export const siteConfig = {
  brand: {
    name: "Điện Máy KDT-89",
    legalName: "Công ty TNHH KDT-89",
    tagline: "Cung cấp & tư vấn thiết bị điện máy công trình",
    website: "https://dienmaykdt89.com",
    logoText: "KDT-89",
    logoUrl: "/logo.png", // File logo chính thức của Điện Máy KDT-89 trong public/logo.png
  },
  contact: {
    hotlines: [
      { display: "0918 064 164", raw: "0918064164", zalo: "https://zalo.me/0918064164", label: "Ms. Ngọc" },
      { display: "0903 667 355", raw: "0903667355", zalo: "https://zalo.me/0903667355", label: "Mr. Dũng" },
    ],
    primaryZaloUrl: "https://zalo.me/0918064164",
    primaryPhone: "0918064164",
    address: "89-91 Đường Số 1, KDC Hiệp Ân, Phường Chánh Hưng, TP. Hồ Chí Minh",
    workingHours: "08:00 - 18:00 (Thứ Hai - Chủ Nhật)",
  },
  hero: {
    badge: "Kênh Báo Giá Công Trình KDT-89",
    headline: "Báo giá điện máy cho nhà trọ, CHDV, khách sạn và công trình",
    description: "Gửi số phòng hoặc danh sách thiết bị để KDT-89 tư vấn phương án phù hợp và báo giá.",
    ctaQuoteText: "Nhận báo giá công trình",
    ctaZaloText: "Nhắn Zalo tư vấn",
  },
  categories: [
    {
      id: "may-lanh",
      name: "Máy lạnh",
      shortDesc: "Các dòng Inverter tiết kiệm điện, máy lạnh treo tường cho phòng trọ, CHDV, khách sạn.",
      brandsHint: "Daikin, Panasonic, Casper, Midea, Funiki...",
      tag: "Nhóm chính",
      badgeCount: "1.0 HP – 2.5 HP",
      featuredSpecs: ["Inverter tiết kiệm điện 40-60%", "Ống đồng tiêu chuẩn công trình", "Bảo hành chính hãng 2-5 năm"]
    },
    {
      id: "may-tam-nong",
      name: "Máy tắm nóng",
      shortDesc: "Máy nước nóng trực tiếp và gián tiếp an toàn cho phòng tắm nhà trọ, căn hộ, khách sạn.",
      brandsHint: "Ariston, Ferroli, Toshiba...",
      tag: "Thiết bị phòng tắm",
      badgeCount: "Trực tiếp & Gián tiếp",
      featuredSpecs: ["Cầu dao chống giật ELCB an toàn", "Bình chứa tráng men Titan bền bỉ", "Có bơm trợ lực nước yếu"]
    },
    {
      id: "may-giat",
      name: "Máy giặt",
      shortDesc: "Máy giặt lồng đứng và lồng ngang phục vụ giặt sấy căn hộ, phòng dịch vụ hoặc khu giặt chung.",
      brandsHint: "Aqua, LG, Toshiba...",
      tag: "Giặt là căn hộ",
      badgeCount: "8.5kg – 15kg",
      featuredSpecs: ["Truyền động êm ái chống ồn", "Động cơ Inverter tiết kiệm nước", "Thiết lập tiện lợi cho khách thuê"]
    },
    {
      id: "tu-lanh",
      name: "Tủ lạnh",
      shortDesc: "Đa dạng dung tích từ tủ mini, tủ 2 cánh cho phòng dịch vụ đến tủ đông, tủ mát bảo quản.",
      brandsHint: "Aqua, Casper, LG, Sanaky...",
      tag: "Bảo quản thực phẩm",
      badgeCount: "90L – 350L",
      featuredSpecs: ["Khay kính cường lực chịu lực", "Không đóng tuyết, ngăn mùi", "Kích thước gọn vừa tủ bếp"]
    },
    {
      id: "tivi",
      name: "TV",
      shortDesc: "Smart TV các kích cỡ 32\", 43\", 50\", 55\" trang bị cho phòng khách, phòng ngủ căn hộ, khách sạn.",
      brandsHint: "LG, Casper, TCL...",
      tag: "Giải trí phòng khách",
      badgeCount: "32\" – 55\" 4K",
      featuredSpecs: ["Độ phân giải 4K sắc nét", "Hệ điều hành Android / Google TV", "Chế độ khoá cài đặt khách sạn"]
    },
    {
      id: "gia-dung-khac",
      name: "Thiết bị gia dụng khác",
      shortDesc: "Bếp từ âm/dương, hút mùi, máy lọc nước, quạt điện hỗ trợ hoàn thiện đồng bộ tiện nghi.",
      brandsHint: "Bếp từ Kaff, quạt máy, gia dụng...",
      tag: "Gia dụng & Nhà bếp",
      badgeCount: "Đồng bộ nội thất",
      featuredSpecs: ["Bếp đôi / đơn mặt kính chịu nhiệt", "Hút mùi công suất cao êm ái", "Bảo hành tận nơi nhanh chóng"]
    },
  ],
  projectTypes: [
    {
      id: "nha-tro",
      title: "Nhà trọ",
      audience: "Chủ nhà trọ, quản lý dãy trọ",
      content: "Tư vấn cấu hình máy lạnh, máy tắm nóng, máy giặt bền bỉ, dễ sử dụng, phù hợp với chi phí đầu tư phòng trọ cho thuê.",
      actionPrompt: "Gửi số lượng phòng để KDT-89 lên danh mục thiết bị phù hợp.",
      keyCriteria: "Chi phí đầu tư thấp · Thu hồi vốn nhanh · Ít hỏng vặt · Dễ bảo trì",
      recommendedMix: "Máy lạnh Casper/Funiki 1.0 HP + Máy nước nóng trực tiếp + Máy giặt chung 10-12kg"
    },
    {
      id: "chdv",
      title: "Căn hộ dịch vụ (CHDV)",
      audience: "Chủ đầu tư, đơn vị vận hành CHDV",
      content: "Phương án trọn bộ thiết bị đồng bộ (máy lạnh Inverter, tủ lạnh, máy giặt, bếp từ, Smart TV) tạo sức hút với khách thuê.",
      actionPrompt: "Gửi mặt bằng hoặc danh sách thiết bị từng phòng để nhận bảng báo giá.",
      keyCriteria: "Ngoại hình sang trọng · Tiết kiệm điện chuẩn Inverter · Vận hành êm ái · Giữ giá trị phòng cao",
      recommendedMix: "Máy lạnh Inverter Daikin/Casper + Tủ lạnh 180-205L + Máy giặt riêng phòng + TV 43\" + Bếp từ đôi"
    },
    {
      id: "khach-san-nho",
      title: "Khách sạn nhỏ & Homestay",
      audience: "Chủ khách sạn mini, nhà nghỉ, homestay",
      content: "Cân đối giữa độ bền, tính thẩm mỹ và công suất vận hành liên tục cho phòng nghỉ lưu trú của khách.",
      actionPrompt: "Gửi số phòng lưu trú và yêu cầu nhóm hàng để được tư vấn model tối ưu.",
      keyCriteria: "Thẩm mỹ tinh tế · Chế độ chạy liên tục ổn định · Chế độ Hotel TV tiện ích · Nước nóng dồi dào",
      recommendedMix: "Máy lạnh Inverter siêu êm + Bình nước nóng gián tiếp 20-30L + Smart TV 43-50\" + Tủ lạnh minibar 90L"
    },
    {
      id: "dan-dung",
      title: "Nhà ở & Công trình dân dụng",
      audience: "Chủ nhà hoàn thiện nhiều phòng, nhà thầu thi công",
      content: "Tư vấn cấu hình thiết bị theo công năng từng tầng, từng phòng, kết hợp tiến độ giao nhận theo từng giai đoạn công trình.",
      actionPrompt: "Gửi bảng bóc tách khối lượng hoặc số lượng thiết bị dự kiến để nhận báo giá.",
      keyCriteria: "Chính hãng 100% · Tiến độ xuất kho linh hoạt theo giai đoạn hoàn thiện · VAT đầy đủ",
      recommendedMix: "Tổ hợp thiết bị đa phòng theo thiết kế kiến trúc và công năng thực tế"
    },
  ],
  steps: [
    {
      step: "01",
      title: "Gửi số phòng hoặc danh sách thiết bị",
      desc: "Điền form nhanh hoặc gửi tin nhắn qua Zalo với số lượng phòng hoặc danh sách thiết bị dự kiến cần trang bị."
    },
    {
      step: "02",
      title: "KDT-89 kiểm tra nhu cầu và sản phẩm phù hợp",
      desc: "Đội ngũ chuyên viên rà soát đặc điểm công trình, tư vấn công suất máy và dòng sản phẩm thích hợp."
    },
    {
      step: "03",
      title: "Nhận tư vấn và báo giá",
      desc: "Nhận bảng đề xuất chi tiết gồm mã sản phẩm, thương hiệu, đơn giá và phương án vận chuyển rõ ràng."
    },
    {
      step: "04",
      title: "Thống nhất phương án giao hàng/lắp đặt theo thực tế",
      desc: "Hai bên chốt phương án, tiến độ xuất kho và điều phối đội kỹ thuật giao nhận phù hợp với tiến độ công trình."
    },
  ],
  realEvidence: {
    title: "Hình ảnh sản phẩm/kho/giao hàng thực tế",
    subtitle: "KDT-89 chuẩn bị thiết bị xuất kho và điều phối giao nhận tận nơi cho các công trình",
    items: [
      {
        id: 1,
        caption: "Xuất kho máy lạnh số lượng cho công trình căn hộ dịch vụ",
        placeholderLabel: "Kho hàng máy lạnh KDT-89 TP.HCM",
        imageSrc: warehouseImage,
        tag: "Xuất kho lô lớn"
      },
      {
        id: 2,
        caption: "Kiểm tra và chuẩn bị thiết bị máy tắm nóng trước khi giao",
        placeholderLabel: "Kho thiết bị máy tắm nóng KDT-89",
        imageSrc: installationImage,
        tag: "Kiểm tra thiết bị"
      },
      {
        id: 3,
        caption: "Chuyến xe giao thiết bị điện máy đến công trình nhà trọ",
        placeholderLabel: "Xe giao hàng tận chân công trình KDT-89",
        imageSrc: deliveryImage,
        tag: "Giao tận chân công trình"
      },
      {
        id: 4,
        caption: "Bàn giao máy giặt và tủ lạnh đồng bộ cho chủ đầu tư",
        placeholderLabel: "Bàn giao máy giặt & tủ lạnh KDT-89",
        imageSrc: heroImage,
        tag: "Đồng bộ nội thất"
      },
      {
        id: 5,
        caption: "Kho hàng thực tế tại 89-91 Đường Số 1, KDC Hiệp Ân, TP.HCM",
        placeholderLabel: "Tổng kho thiết bị KDT-89 tại TP.HCM",
        imageSrc: warehouseImage,
        tag: "Kho bãi trực tiếp"
      },
      {
        id: 6,
        caption: "Đội ngũ kỹ thuật hỗ trợ giao lắp thiết bị tại công trình thực tế",
        placeholderLabel: "Kỹ thuật giao nhận thiết bị KDT-89",
        imageSrc: installationImage,
        tag: "Kỹ thuật hỗ trợ"
      },
    ],
  },
  galleryAssets: {
    hero: heroImage,
    warehouse: warehouseImage,
    delivery: deliveryImage,
    installation: installationImage,
  }
};
