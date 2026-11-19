import React, { useState, useEffect } from 'react';
import {
  RoomModelItem,
  DEFAULT_ROOM_MODELS,
  SiteSettingsData,
  saveSiteSettingsToFirebase,
} from '../services/siteContentService';
import { compressImageFile, extractReadableFirebaseError } from '../utils/imageCompressor';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Images,
  Cloud,
  Save,
  HelpCircle,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';

interface AdminRoom3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettingsData;
  activeModelId?: string;
  onSelectModel?: (modelId: string) => void;
  onSettingsUpdated: (newSettings: SiteSettingsData) => void;
}

export const AdminRoom3DModal: React.FC<AdminRoom3DModalProps> = ({
  isOpen,
  onClose,
  settings,
  activeModelId,
  onSelectModel,
  onSettingsUpdated,
}) => {
  const [roomModels, setRoomModels] = useState<RoomModelItem[]>(settings.roomModels || DEFAULT_ROOM_MODELS);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'guide'>('list');
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // New room draft form
  const [newTitle, setNewTitle] = useState('');
  const [newArea, setNewArea] = useState<number>(20);
  const [newOccupants, setNewOccupants] = useState<number>(2);
  const [newRoomType, setNewRoomType] = useState('Căn hộ dịch vụ (CHDV)');
  const [newImgSrc, setNewImgSrc] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRoomModels(
        settings.roomModels && settings.roomModels.length > 0
          ? settings.roomModels
          : DEFAULT_ROOM_MODELS
      );
      setErrorMsg(null);
      setConfirmReset(false);
      setHasUnsavedEdits(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const cleanRoomModelsPayload = (models: RoomModelItem[]): RoomModelItem[] =>
    models.map((m) => ({
      id: m.id,
      name: m.name || 'Căn hộ mẫu',
      area: Number(m.area) || 20,
      occupants: Number(m.occupants) || 2,
      roomType: m.roomType || 'Căn hộ dịch vụ (CHDV)',
      imageSrc: m.imageSrc || '/assets/rooms/chdv_bedroom_ac_tv.jpg',
      is3dEmbed: Boolean(m.is3dEmbed),
      ...(m.embedUrl ? { embedUrl: m.embedUrl } : {}),
      ...(m.description ? { description: m.description } : {}),
    }));

  const persistRoomModelsToFirebase = async (modelsToSave: RoomModelItem[], toastText: string) => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const cleanedModels = cleanRoomModelsPayload(modelsToSave);
      const result = await saveSiteSettingsToFirebase({
        ...settings,
        roomModels: cleanedModels,
      });
      onSettingsUpdated(result);
      setHasUnsavedEdits(false);
      setSaveMessage(toastText);
      setTimeout(() => setSaveMessage(null), 4000);
      return true;
    } catch (err) {
      console.error('Error saving room models to Firebase:', err);
      setErrorMsg(extractReadableFirebaseError(err));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Compress uploaded image & immediately sync to Firebase for existing room models
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetModelId?: string
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsCompressing(true);
    setErrorMsg(null);
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 920,
        maxHeight: 690,
        quality: 0.72,
        maxBase64Length: 90_000,
      });

      if (targetModelId) {
        const nextModels = roomModels.map((m) =>
          m.id === targetModelId ? { ...m, imageSrc: compressed } : m
        );
        setRoomModels(nextModels);
        await persistRoomModelsToFirebase(
          nextModels,
          'Đã nén ảnh mới và tự động đồng bộ lên Firebase!'
        );
      } else {
        setNewImgSrc(compressed);
        setPreviewImg(compressed);
      }
    } catch (err) {
      setErrorMsg(extractReadableFirebaseError(err));
    } finally {
      setIsCompressing(false);
    }
  };

  // Update editable fields on an existing room model
  const handleUpdateModelField = <K extends keyof RoomModelItem>(
    id: string,
    field: K,
    value: RoomModelItem[K]
  ) => {
    setHasUnsavedEdits(true);
    setRoomModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Add new room model and auto-save to Firebase
  const handleAddNewRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const finalImage = newImgSrc.trim() || '/assets/rooms/chdv_bedroom_ac_tv.jpg';

    const newItem: RoomModelItem = {
      id: `room_${Date.now()}`,
      name: newTitle.trim(),
      area: newArea,
      occupants: newOccupants,
      roomType: newRoomType,
      imageSrc: finalImage,
      is3dEmbed: false,
      description: newDescription.trim(),
    };

    const nextModels = [...roomModels, newItem];
    setRoomModels(nextModels);

    const saved = await persistRoomModelsToFirebase(
      nextModels,
      'Đã thêm mẫu căn hộ mới và lưu lên Firebase!'
    );

    if (saved) {
      setNewTitle('');
      setNewArea(20);
      setNewOccupants(2);
      setNewImgSrc('');
      setNewDescription('');
      setPreviewImg(null);
      setActiveTab('list');
    }
  };

  // Delete model and auto-save to Firebase
  const handleDeleteModel = async (id: string) => {
    if (roomModels.length <= 1) {
      setErrorMsg('Cần giữ lại ít nhất 1 mẫu căn hộ trên website anh nhé.');
      return;
    }
    const nextModels = roomModels.filter((m) => m.id !== id);
    setRoomModels(nextModels);
    await persistRoomModelsToFirebase(nextModels, 'Đã xóa mẫu căn hộ và cập nhật Firebase!');
  };

  // Save directly to Firebase Firestore (for text / URL edits)
  const handleSaveToFirebase = async () => {
    await persistRoomModelsToFirebase(
      roomModels,
      'Đã đồng bộ toàn bộ thay đổi lên Firebase!'
    );
  };

  const handleConfirmReset = async () => {
    setRoomModels(DEFAULT_ROOM_MODELS);
    setConfirmReset(false);
    await persistRoomModelsToFirebase(
      DEFAULT_ROOM_MODELS,
      'Đã khôi phục danh sách mẫu gốc và lưu lên Firebase!'
    );
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
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                <span>Quản Lý Ảnh &amp; Thông Tin Mẫu Căn Hộ</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Tự động lưu Firebase
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tải ảnh mới sẽ tự động nén &amp; lưu ngay lên Firebase Cloud. Nếu sửa chữ hoặc dán link URL, nhớ bấm nút Lưu bên dưới.
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
        <div className="flex items-center border-b border-neutral-800 bg-neutral-925 px-4 gap-2 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'list'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Images className="w-4 h-4" />
            <span>Danh Sách Mẫu Căn Hộ ({roomModels.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Mẫu Căn Hộ Mới</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Hướng Dẫn</span>
          </button>
        </div>

        {/* Status / Error Notifications */}
        {(isCompressing || isSaving) && (
          <div className="px-5 py-2.5 bg-amber-950/70 border-b border-amber-500/30 text-xs text-amber-300 font-semibold flex items-center gap-2 shrink-0">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{isCompressing ? 'Đang nén tối ưu ảnh...' : 'Đang lưu và đồng bộ lên Firebase Cloud...'}</span>
          </div>
        )}
        {saveMessage && (
          <div className="px-5 py-2.5 bg-emerald-950/80 border-b border-emerald-500/40 text-xs text-emerald-300 font-bold flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}
        {errorMsg && (
          <div className="px-5 py-2.5 bg-red-950/80 border-b border-red-500/40 text-xs text-red-200 font-semibold flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-red-300 hover:text-white underline text-[11px] shrink-0 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: DANH SÁCH MẪU CĂN HỘ */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 flex-wrap gap-2">
                <span>Tải ảnh sẽ lưu thẳng lên Firebase. Khi sửa tên, mô tả hoặc link ảnh URL, anh bấm <strong className="text-orange-400">"Lưu &amp; Đồng Bộ Firebase"</strong> bên dưới:</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomModels.map((model) => {
                  const isActive = activeModelId === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                        isActive
                          ? 'bg-neutral-950 border-orange-500 ring-2 ring-orange-500/20 shadow-lg'
                          : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Thumbnail Preview */}
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800">
                          <img
                            src={model.imageSrc}
                            alt={model.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-neutral-950/85 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-neutral-700">
                            {model.area}m² · {model.occupants} người
                          </div>
                        </div>

                        {/* Clear Visible Image Upload + URL Edit */}
                        <div className="flex items-center gap-2">
                          <label className="flex-1 py-2 px-3 rounded-lg bg-orange-600/20 hover:bg-orange-600/35 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tải ảnh / GIF mới</span>
                            <input
                              type="file"
                              accept="image/*,.gif"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, model.id)}
                            />
                          </label>

                          {onSelectModel && (
                            <button
                              type="button"
                              onClick={() => onSelectModel(model.id)}
                              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                                isActive
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                              }`}
                            >
                              {isActive ? 'Đang Chọn' : 'Xem Mẫu'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteModel(model.id)}
                            className="p-2 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-300 cursor-pointer shrink-0"
                            title="Xóa mẫu căn hộ này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-2 text-xs">
                          <div>
                            <label className="block text-[10.5px] font-semibold text-neutral-400 mb-0.5">
                              Tên hiển thị mẫu căn hộ:
                            </label>
                            <input
                              type="text"
                              value={model.name}
                              onChange={(e) => handleUpdateModelField(model.id, 'name', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-semibold focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10.5px] font-semibold text-neutral-400 mb-0.5">
                                Diện tích (m²):
                              </label>
                              <input
                                type="number"
                                min={10}
                                max={200}
                                value={model.area}
                                onChange={(e) =>
                                  handleUpdateModelField(
                                    model.id,
                                    'area',
                                    Math.max(10, parseInt(e.target.value, 10) || 20)
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10.5px] font-semibold text-neutral-400 mb-0.5">
                                Số người ở:
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={12}
                                value={model.occupants}
                                onChange={(e) =>
                                  handleUpdateModelField(
                                    model.id,
                                    'occupants',
                                    Math.max(1, parseInt(e.target.value, 10) || 1)
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-semibold text-neutral-400 mb-0.5">
                              Link ảnh trực tiếp (URL hoặc đường dẫn):
                            </label>
                            <div className="relative">
                              <LinkIcon className="w-3 h-3 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={model.imageSrc.startsWith('data:') ? '(Đang dùng ảnh tải từ máy)' : model.imageSrc}
                                readOnly={model.imageSrc.startsWith('data:')}
                                onChange={(e) => handleUpdateModelField(model.id, 'imageSrc', e.target.value)}
                                className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 text-[11px] focus:outline-none focus:border-orange-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-semibold text-neutral-400 mb-0.5">
                              Mô tả ngắn:
                            </label>
                            <textarea
                              rows={2}
                              value={model.description || ''}
                              onChange={(e) => handleUpdateModelField(model.id, 'description', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 text-[11px] focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: THÊM MẪU CĂN HỘ MỚI */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddNewRoom} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-300">
                Anh có thể tải ảnh chụp căn hộ thực tế / GIF từ máy tính, điện thoại hoặc dán đường link ảnh URL. Hệ thống sẽ tự đồng bộ lên Firebase ngay khi thêm.
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tên mẫu căn hộ <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Căn Hộ 1 Phòng Ngủ Master (32m²)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Diện tích (m²):
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="150"
                    value={newArea}
                    onChange={(e) => setNewArea(parseInt(e.target.value, 10) || 20)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Số người ở:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newOccupants}
                    onChange={(e) => setNewOccupants(parseInt(e.target.value, 10) || 2)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Mô hình:
                  </label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Căn hộ dịch vụ (CHDV)">Căn hộ dịch vụ (CHDV)</option>
                    <option value="Phòng trọ cao cấp">Phòng trọ cao cấp</option>
                    <option value="Khách sạn / Homestay">Khách sạn / Homestay</option>
                    <option value="Căn hộ Studio / 1PN">Căn hộ Studio / 1PN</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Chọn ảnh căn hộ thực tế:
                </span>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                    Cách 1: Tải file ảnh từ máy (JPG, PNG, WEBP, GIF):
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-neutral-700 hover:border-orange-500 rounded-xl bg-neutral-900 cursor-pointer transition-colors text-xs font-semibold text-neutral-300">
                    <Upload className="w-4 h-4 text-orange-400" />
                    <span>Bấm vào đây để chọn file ảnh từ máy...</span>
                    <input
                      type="file"
                      accept="image/*,.gif"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e)}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                    Cách 2: Hoặc dán đường link ảnh trực tiếp (URL):
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/anh-can-ho.jpg"
                    value={newImgSrc}
                    onChange={(e) => {
                      setNewImgSrc(e.target.value);
                      setPreviewImg(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {previewImg && (
                  <div className="pt-2">
                    <span className="text-[11px] text-neutral-400 block mb-1">Xem trước ảnh:</span>
                    <div className="w-48 aspect-video rounded-lg overflow-hidden border border-neutral-700">
                      <img src={previewImg} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Mô tả vắn tắt:
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Không gian mở hiện đại, bố trí quầy bar bếp và phòng ngủ thoáng..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving || isCompressing}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isSaving ? 'Đang lưu lên Firebase...' : 'Thêm Mẫu Căn Hộ & Lưu Ngay'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: HƯỚNG DẪN */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-5 rounded-xl border border-neutral-800">
              <h4 className="text-sm font-bold text-orange-400">
                Hướng dẫn cập nhật ảnh căn hộ mẫu
              </h4>
              <p className="text-neutral-400">
                • Khi bấm <strong>"Tải ảnh / GIF mới"</strong>, ảnh từ điện thoại hoặc máy tính của anh sẽ tự động được nén gọn và lưu ngay lên Firebase Firestore.
              </p>
              <p className="text-neutral-400">
                • Nếu anh sửa tên mẫu, diện tích hoặc dán link ảnh URL, anh nhớ bấm nút <strong>"Lưu &amp; Đồng Bộ Firebase"</strong> ở góc dưới bên phải trước khi đóng bảng quản trị nhé.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-neutral-400 hover:text-neutral-200 underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục danh sách gốc</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-300">Khôi phục mẫu gốc?</span>
                <button
                  type="button"
                  onClick={handleConfirmReset}
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
            {hasUnsavedEdits && (
              <span className="text-xs font-bold text-amber-400">
                Có thay đổi chưa lưu!
              </span>
            )}

            <button
              type="button"
              disabled={isSaving || isCompressing}
              onClick={handleSaveToFirebase}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu & Đồng Bộ Firebase'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
