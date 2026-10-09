import React, { useState } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Mật khẩu mặc định quản trị (dễ nhớ, anh có thể dùng 123456 hoặc kdt89admin)
export const DEFAULT_ADMIN_PASS = '123456';
const BACKUP_ADMIN_PASS = 'kdt89admin';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPass = localStorage.getItem('kdt_admin_pass');
    const inputPass = password.trim();
    const isCorrect = savedPass 
      ? inputPass === savedPass 
      : (inputPass === DEFAULT_ADMIN_PASS || inputPass === BACKUP_ADMIN_PASS);

    if (isCorrect) {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl p-6 text-neutral-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-800 transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-2xl mb-3 text-orange-400">
            🔐
          </div>
          <h3 className="text-lg font-bold text-white">Xác thực Quản trị viên</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Chỉ dành riêng cho anh Tuấn &amp; quản trị viên KDT-89. Khách hàng thông thường sẽ không thể xem hay chỉnh sửa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Nhập mật khẩu quản trị:
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Nhập mật khẩu..."
              className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border text-sm text-white placeholder-neutral-500 focus:outline-none transition-all ${
                error 
                  ? 'border-red-500 ring-2 ring-red-500/20' 
                  : 'border-neutral-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
              }`}
            />
            {error && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <span>⚠️</span> Mật khẩu chưa đúng. Vui lòng thử lại!
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-950/40 transition-all cursor-pointer active:scale-[0.98]"
          >
            Đăng nhập Quản trị
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-neutral-800/80 text-center">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-[11px] text-neutral-500 hover:text-orange-400 underline transition-colors"
          >
            {showHint ? 'Ẩn gợi ý' : 'Quên hoặc xem mật khẩu mặc định?'}
          </button>

          {showHint && (
            <div className="mt-2 p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 text-left">
              <p className="text-neutral-400 mb-1">Mật khẩu ban đầu mặc định của anh là:</p>
              <div className="flex items-center justify-between font-mono font-bold text-amber-400 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                <span>123456</span>
                <span className="text-neutral-500 font-normal text-[10px]">(hoặc kdt89admin)</span>
                <button
                  type="button"
                  onClick={() => {
                    setPassword('123456');
                    setError(false);
                  }}
                  className="text-[10px] text-orange-400 hover:text-white underline font-sans ml-2"
                >
                  Tự điền
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
