import { doc, setDoc, getDocs, collection, query, orderBy, limit, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './firebaseErrors';

export interface LeadRecord {
  id: string;
  timestamp: string;
  fullName: string;
  phoneNumber: string;
  projectAddress: string;
  projectType: string;
  roomCount: string;
  roomArea?: number;
  occupants?: number;
  selectedCategories: string;
  notes: string;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  source?: string;
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

export const fetchLeadsFromFirebase = async (): Promise<LeadRecord[]> => {
  try {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    const remoteLeads: LeadRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      remoteLeads.push({
        id: docSnap.id,
        timestamp: data.createdAt || new Date().toISOString(),
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        projectAddress: data.projectAddress || '',
        projectType: data.projectType || '',
        roomCount: String(data.roomCount || 1),
        roomArea: data.roomArea,
        occupants: data.occupants,
        selectedCategories: Array.isArray(data.selectedCategories) 
          ? data.selectedCategories.join(', ') 
          : String(data.selectedCategories || ''),
        notes: data.notes || '',
        status: (data.status as LeadRecord['status']) || 'new',
        source: data.source || 'web',
      });
    });

    if (remoteLeads.length > 0) {
      // Merge with local
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteLeads));
      } catch {
        // ignore
      }
      return remoteLeads;
    }
  } catch (err) {
    console.warn('Failed to fetch remote leads from Firestore:', err);
  }
  return getStoredLeads();
};

export const saveLead = async (lead: Omit<LeadRecord, 'id' | 'status'>): Promise<LeadRecord> => {
  const current = getStoredLeads();
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const newRecord: LeadRecord = {
    ...lead,
    id: leadId,
    status: 'new',
  };

  // 1. Save local immediately
  const updated = [newRecord, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving lead locally:', e);
  }

  // 2. Sync to Firebase Firestore
  try {
    const docRef = doc(db, 'leads', leadId);
    await setDoc(docRef, {
      fullName: lead.fullName || 'Khách hàng',
      phoneNumber: lead.phoneNumber,
      projectAddress: lead.projectAddress || '',
      projectType: lead.projectType || 'Công trình',
      roomCount: parseInt(lead.roomCount, 10) || 1,
      roomArea: lead.roomArea || null,
      occupants: lead.occupants || null,
      selectedCategories: lead.selectedCategories ? lead.selectedCategories.split(',').map(s => s.trim()) : [],
      notes: lead.notes || '',
      status: 'new',
      createdAt: new Date().toISOString(),
      source: lead.source || 'web_form',
    });
    console.log('Lead synced to Firebase Firestore successfully:', leadId);
  } catch (error) {
    console.warn('Could not sync lead to Firestore immediately:', error);
  }

  return newRecord;
};

export const updateLeadStatus = async (id: string, status: LeadRecord['status']) => {
  const current = getStoredLeads();
  const updated = current.map(item => item.id === id ? { ...item, status } : item);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating lead status locally:', e);
  }

  // Update in Firestore
  try {
    const docRef = doc(db, 'leads', id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Could not update lead in Firestore:', error);
  }
};

export const deleteLeadFromFirebase = async (id: string) => {
  const current = getStoredLeads();
  const updated = current.filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting lead locally:', e);
  }

  try {
    const docRef = doc(db, 'leads', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Could not delete lead from Firestore:', error);
  }
};

export const exportLeadsToCSV = (customList?: LeadRecord[]) => {
  const leads = customList || getStoredLeads();
  if (leads.length === 0) return;

  const headers = ['Thời gian', 'Họ tên', 'Số điện thoại', 'Địa chỉ công trình', 'Loại công trình', 'Số phòng', 'Diện tích/Phòng', 'Số người', 'Thiết bị cần', 'Ghi chú', 'Trạng thái'];
  const rows = leads.map(l => [
    `"${new Date(l.timestamp).toLocaleString('vi-VN')}"`,
    `"${l.fullName.replace(/"/g, '""')}"`,
    `"${l.phoneNumber}"`,
    `"${l.projectAddress.replace(/"/g, '""')}"`,
    `"${l.projectType.replace(/"/g, '""')}"`,
    `"${l.roomCount}"`,
    `"${l.roomArea ? l.roomArea + 'm²' : '-'}"`,
    `"${l.occupants ? l.occupants + ' người' : '-'}"`,
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
