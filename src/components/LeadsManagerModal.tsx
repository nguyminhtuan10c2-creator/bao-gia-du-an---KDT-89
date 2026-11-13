import React, { useState, useEffect } from 'react';
import { getStoredLeads, updateLeadStatus, exportLeadsToCSV, fetchLeadsFromFirebase, LeadRecord } from '../utils/leadStorage';
import { FORM_ENDPOINT } from '../config/siteConfig';
import { LANDING_PRESETS, LandingModelId } from '../utils/landingPresets';
import { getFunnelMetrics, resetFunnelMetrics, FunnelMetrics } from '../utils/analytics';
import { X, Download, Phone, MessageCircle, FileSpreadsheet, Copy, Check, Clock, ShieldCheck, BarChart3, Link2, RotateCcw } from 'lucide-react';

interface LeadsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadsManagerModal: React.FC<LeadsManagerModalProps> = ({ isOpen, onClose }) => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'ads' | 'guide'>('leads');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<FunnelMetrics>(getFunnelMetrics);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(false);

  const loadAllLeads = async () => {
    setLeads(getStoredLeads());
    setMetrics(getFunnelMetrics());
    setIsLoadingFirebase(true);
    try {
      const remote = await fetchLeadsFromFirebase();
      setLeads(remote);
    } catch {
      // ignore
    } finally {
      setIsLoadingFirebase(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllLeads();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dienmaykdt89.com';

  const handleCopyLandingLink = (id: LandingModelId, query: string) => {
    const fullUrl = `${baseUrl}/${query}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleStatusChange = (id: string, status: LeadRecord['status']) => {
    updateLeadStatus(id, status);
    setLeads(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const appsScriptCode = `// ====================================================================
// GOOGLE APPS SCRIPT CHO ĐIỆN MÁY KDT-89 (dienmaykdt89.com)
// Tự động lưu yêu cầu báo giá vào Google Sheets & gửi Email thông báo
// ====================================================================

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Khóa 10s tránh xung đột khi nhiều khách gửi cùng lúc

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Tự động tạo dòng tiêu đề nếu trang tính đang trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời Gian Gửi",
        "Họ Tên Khách Hàng",
        "Số Điện Thoại / Zalo",
        "Địa Chỉ / Khu Vực",
        "Loại Công Trình",
        "Quy Mô (Số Phòng)",
        "Danh Mục Thiết Bị",
        "Ghi Chú Yêu Cầu"
      ]);
      // Định dạng dòng tiêu đề: In đậm, nền xanh đen, chữ trắng
      var headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    // Đọc dữ liệu JSON gửi từ website
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "HH:mm:ss dd/MM/yyyy");
    var fullName = data.fullName || "Khách liên hệ";
    var phoneNumber = "'" + (data.phoneNumber || ""); // Dấu ' giúp không mất số 0 đầu
    var projectAddress = data.projectAddress || "Chưa cung cấp";
    var projectType = data.projectType || "Chưa chọn";
    var roomCount = data.roomCount || "1";
    var selectedCategories = data.selectedCategories || "Chưa chọn";
    var notes = data.notes || "";

    // 1. Thêm dòng mới vào Google Sheets
    sheet.appendRow([
      timestamp,
      fullName,
      phoneNumber,
      projectAddress,
      projectType,
      roomCount,
      selectedCategories,
      notes
    ]);

    // 2. Gửi Email thông báo tức thì về Gmail của anh
    try {
      MailApp.sendEmail({
        to: "nguyminhtuan10C2@gmail.com",
        subject: "[KDT-89 Báo Giá Mới] " + fullName + " - " + (data.phoneNumber || "") + " (" + projectType + ")",
        htmlBody: 
          "<div style='font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>" +
          "<h2 style='color: #d97706; margin-top: 0;'>🔔 CÓ YÊU CẦU BÁO GIÁ CÔNG TRÌNH MỚI</h2>" +
          "<p>Khách hàng vừa gửi yêu cầu từ website <b>dienmaykdt89.com</b>:</p>" +
          "<table style='width: 100%; border-collapse: collapse; margin: 15px 0;'>" +
            "<tr><td style='padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 35%;'>Họ tên:</td><td style='padding: 8px; border-bottom: 1px solid #f1f5f9;'>" + fullName + "</td></tr>" +
            "<tr><td style='padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;'>Số điện thoại / Zalo:</td><td style='padding: 8px; border-bottom: 1px solid #f1f5f9; color: #1e40af; font-weight: bold;'><a href='tel:" + (data.phoneNumber || "") + "'>" + (data.phoneNumber || "") + "</a></td></tr>" +
            "<tr><td style='padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;'>Địa chỉ công trình:</td><td style='padding: 8px; border-bottom: 1px solid #f1f5f9;'>" + projectAddress + "</td></tr>" +
            "<tr><td style='padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;'>Loại công trình:</td><td style='padding: 8px; border-bottom: 1px solid #f1f5f9;'>" + projectType + " (" + roomCount + " phòng)</td></tr>" +
            "<tr><td style='padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;'>Thiết bị cần báo giá:</td><td style='padding: 8px; border-bottom: 1px solid #f1f5f9; color: #047857; font-weight: bold;'>" + selectedCategories + "</td></tr>" +
            "<tr><td style='padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;'>Ghi chú của khách:</td><td style='padding: 8px; border-bottom: 1px solid #f1f5f9;'>" + (notes || "Không có") + "</td></tr>" +
            "<tr><td style='padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;'>Thời gian gửi:</td><td style='padding: 8px; border-bottom: 1px solid #f1f5f9;'>" + timestamp + "</td></tr>" +
          "</table>" +
          "<p style='margin-top: 20px;'><a href='https://zalo.me/" + (data.phoneNumber || "").replace(/[^0-9]/g, '') + "' style='background: #0284c7; color: #ffffff; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Nhắn Zalo cho khách ngay</a></p>" +
          "</div>"
      });
    } catch (mailErr) {
      Logger.log("Email error: " + mailErr);
    }

    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Saved successfully" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6">
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold">
                Trung Tâm Quản Lý Dữ Liệu Báo Giá KDT-89
              </span>
              <span className="text-xs bg-amber-500 text-neutral-950 font-bold px-2 py-0.5 rounded">
                Dành cho Quản lý
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Xem danh bạ khách hàng đã gửi form, xuất file Excel và cấu hình nhận kết quả tự động
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'leads'
                  ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Danh sách khách đã điền ({leads.length})
            </button>
            <button
              onClick={() => {
                setMetrics(getFunnelMetrics());
                setActiveTab('ads');
              }}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ads'
                  ? 'border-orange-600 text-orange-700 bg-white rounded-t-lg'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-orange-600" />
              <span>3 Link Quảng Cáo &amp; Đo Lường</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cách nhận data về Google Sheets & Email</span>
            </button>
          </div>

          {activeTab === 'leads' && leads.length > 0 && (
            <button
              onClick={() => exportLeadsToCSV(leads)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg shadow-2xs mb-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tải file Excel / CSV ({leads.length} khách)</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'leads' ? (
            <div>
              {leads.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-700">Chưa có lượt gửi form nào</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Khi khách hàng bấm &quot;Gửi Yêu Cầu Báo Giá KDT-89&quot; trên website, toàn bộ dữ liệu sẽ lập tức xuất hiện tại đây và đồng thời lưu vào Google Sheets của bạn.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-100 text-neutral-700 font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-3">Thời gian</th>
                        <th className="p-3">Khách hàng</th>
                        <th className="p-3">Số điện thoại</th>
                        <th className="p-3">Công trình & Quy mô</th>
                        <th className="p-3">Thiết bị & Ghi chú</th>
                        <th className="p-3">Trạng thái</th>
                        <th className="p-3 text-right">Liên hệ nhanh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="p-3 whitespace-nowrap text-neutral-500 tabular-nums">
                            {new Date(lead.timestamp).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-3 font-semibold text-neutral-900">
                            {lead.fullName}
                          </td>
                          <td className="p-3 font-bold text-neutral-900 tabular-nums">
                            {lead.phoneNumber}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-neutral-800 block">
                              {lead.projectType} ({lead.roomCount} phòng)
                            </span>
                            <span className="text-neutral-500 text-[11px] block truncate max-w-xs">
                              {lead.projectAddress || 'Chưa rõ khu vực'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-neutral-800 font-medium block">
                              {lead.selectedCategories}
                            </span>
                            {lead.notes && (
                              <span className="text-neutral-500 text-[11px] block truncate max-w-xs italic">
                                {lead.notes}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                              className="text-[11px] font-semibold rounded px-2 py-1 border border-neutral-200 bg-white"
                            >
                              <option value="new">Mới nhận</option>
                              <option value="contacted">Đã liên hệ</option>
                              <option value="quoted">Đã gửi báo giá</option>
                              <option value="closed">Đã chốt đơn</option>
                            </select>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`tel:${lead.phoneNumber}`}
                                className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                title="Gọi điện cho khách"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://zalo.me/${lead.phoneNumber.replace(/\s+/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                                title="Mở Zalo nhắn cho khách"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'ads' ? (
            <div className="space-y-6 max-w-4xl">
              {/* 3 Dedicated Landing Links */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                  <Link2 className="w-4 h-4 text-orange-600" />
                  <span>3 Link Landing Chạy Quảng Cáo Theo Từng Tệp Khách Hàng</span>
                </div>
                <p className="text-xs text-neutral-600">
                  Mỗi link sẽ tự động đổi tiêu đề Hero, chọn sẵn mô hình công trình, số phòng gợi ý và nhóm thiết bị mặc định tương ứng trong Dự toán &amp; Form Báo Giá:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(['chdv', 'nha-tro', 'khach-san'] as LandingModelId[]).map((id) => {
                    const preset = LANDING_PRESETS[id];
                    const fullUrl = `${baseUrl}/${preset.queryString}`;
                    return (
                      <div key={id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2.5 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="inline-block text-[11px] font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                            {preset.audienceLabel}
                          </span>
                          <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                            &ldquo;{preset.adTitle}&rdquo;
                          </h4>
                          <p className="text-[11px] text-neutral-600">
                            Chọn sẵn: <strong>{preset.projectTypeTitle}</strong> ({preset.defaultRoomCount} phòng)
                          </p>
                          <code className="block text-[10.5px] font-mono text-neutral-700 bg-white px-2 py-1.5 rounded border border-neutral-200 break-all">
                            {fullUrl}
                          </code>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyLandingLink(id, preset.queryString)}
                          className="w-full py-2 px-3 rounded-lg bg-neutral-900 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedLinkId === id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Đã copy link!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy link quảng cáo</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Funnel Event Tracking Counters */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                    <span>Đo Lường Sự Kiện Chuyển Đổi (Funnel Tracking)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMetrics(resetFunnelMetrics())}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại số đếm</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'page_view' as const, label: '1. Xem trang (page_view)' },
                    { key: 'click_quote_cta' as const, label: '2. Bấm Nhận báo giá' },
                    { key: 'open_estimator' as const, label: '3. Mở / Dùng dự toán' },
                    { key: 'apply_estimator_config' as const, label: '4. Nạp cấu hình vào form' },
                    { key: 'click_zalo' as const, label: '5. Bấm nút Zalo' },
                    { key: 'submit_lead_success' as const, label: '6. Gửi form thành công' },
                  ].map((item) => (
                    <div key={item.key} className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                      <span className="text-[11px] font-semibold text-neutral-500 block">{item.label}</span>
                      <span className="text-2xl font-black text-orange-600 tabular-nums mt-1 block">
                        {metrics[item.key] || 0}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
                  <p className="font-bold">Tích hợp sẵn Google Tag Manager / GA4 / Meta Pixel:</p>
                  <p className="text-neutral-700">
                    Mỗi hành động đều đẩy sự kiện <code className="font-mono bg-white px-1 rounded">kdt89_*</code> vào{' '}
                    <code className="font-mono bg-white px-1 rounded">window.dataLayer</code>, tự gửi{' '}
                    <code className="font-mono bg-white px-1 rounded">generate_lead</code> lên GA4 và{' '}
                    <code className="font-mono bg-white px-1 rounded">Lead</code> / <code className="font-mono bg-white px-1 rounded">Contact</code> lên Facebook Pixel khi anh gắn mã theo dõi.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                <div className="font-bold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>3 Cách để anh nhận kết quả khi khách điền Form báo giá:</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-neutral-700 pl-1">
                  <li>
                    <strong>Cách 1 (Google Sheets tự động):</strong> Toàn bộ khách điền sẽ tự động nhảy vào 1 file Google Sheets trên Drive của anh theo thời gian thực (hướng dẫn chi tiết bên dưới).
                  </li>
                  <li>
                    <strong>Cách 2 (Zalo trực tiếp):</strong> Khách điền xong bấm &quot;Gửi qua Zalo&quot;, tin nhắn sẽ nhảy thẳng vào Zalo số <strong>0918 064 167</strong> của anh.
                  </li>
                  <li>
                    <strong>Cách 3 (Bảng quản trị tại website):</strong> Mọi khách điền form đều được tự động lưu ngay trong bảng &quot;Danh sách khách đã điền&quot; ở tab bên cạnh, có thể bấm tải file Excel về máy tính bất kỳ lúc nào.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900">
                    Mã Google Apps Script sẵn dùng (Chỉ cần Copy &amp; Paste vào Google Sheets):
                  </h4>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Đã copy mã!" : "Copy toàn bộ mã"}</span>
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-200 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed border border-neutral-800">
                    {appsScriptCode}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span>URL Webhook hiện tại: <code className="text-amber-800 font-mono text-[11px]">{FORM_ENDPOINT}</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
