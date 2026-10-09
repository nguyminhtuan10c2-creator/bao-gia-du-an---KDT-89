export interface LeadRecord {
  id: string;
  timestamp: string;
  fullName: string;
  phoneNumber: string;
  projectAddress: string;
  projectType: string;
  roomCount: string;
  selectedCategories: string;
  notes: string;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
}

const STORAGE_KEY = 'kdt89_quote_leads';

export const getStoredLeads = (): LeadRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored leads:', e);
    return [];
  }
};

export const saveLead = (lead: Omit<LeadRecord, 'id' | 'status'>): LeadRecord => {
  const current = getStoredLeads();
  const newRecord: LeadRecord = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    status: 'new',
  };
  const updated = [newRecord, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving lead:', e);
  }
  return newRecord;
};

export const updateLeadStatus = (id: string, status: LeadRecord['status']) => {
  const current = getStoredLeads();
  const updated = current.map(item => item.id === id ? { ...item, status } : item);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating lead status:', e);
  }
};

export const exportLeadsToCSV = () => {
  const leads = getStoredLeads();
  if (leads.length === 0) return;

  const headers = ['Thời gian', 'Họ tên', 'Số điện thoại', 'Địa chỉ công trình', 'Loại công trình', 'Số phòng', 'Thiết bị cần', 'Ghi chú', 'Trạng thái'];
  const rows = leads.map(l => [
    `"${new Date(l.timestamp).toLocaleString('vi-VN')}"`,
    `"${l.fullName.replace(/"/g, '""')}"`,
    `"${l.phoneNumber}"`,
    `"${l.projectAddress.replace(/"/g, '""')}"`,
    `"${l.projectType.replace(/"/g, '""')}"`,
    `"${l.roomCount}"`,
    `"${l.selectedCategories.replace(/"/g, '""')}"`,
    `"${l.notes.replace(/"/g, '""')}"`,
    `"${l.status}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `danh_sach_bao_gia_kdt89_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
