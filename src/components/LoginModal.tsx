import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  ShieldCheck, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole, targetClass?: string) => void;
}

const CLASS_LIST = [
  '1A', '1B', '1D',
  '2A', '2B', '2D',
  '3A', '3B',
  '4A', '4B',
  '5A', '5B',
  '6A', '6B',
  '7A', '7B',
  '8A', '8B',
  '9A', '9B',
  '10A', '10B',
  '11A'
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Student state
  const [studentClass, setStudentClass] = useState<string>('8A');

  // Admin state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    setUsername('');
    setPassword('');
  };

  const handleBack = () => {
    setSelectedRole(null);
    setError(null);
    setUsername('');
    setPassword('');
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Foydalanuvchi nomi va parol to\'ldirilishi shart.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await login(username, password, 'ADMIN');
      onSuccess(user.role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Kirish muvaffaqiyatsiz bo\'ldi. Ma\'lumotlarni tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess('STUDENT', studentClass);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all text-white">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            {selectedRole && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-1"
                title="Orqaga"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {selectedRole === 'ADMIN' 
                  ? 'Admin Kirishi' 
                  : selectedRole === 'STUDENT' 
                  ? 'O‘quvchi Kirishi' 
                  : 'Platformaga Kirish'}
              </h3>
              <p className="text-xs text-slate-400">43-maktab rasmiy elektron portali</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!selectedRole ? (
            /* STEP 1: ROLE SELECTION */
            <div className="space-y-4">
              <div className="text-center pb-2">
                <h4 className="text-lg font-black text-white">Foydalanuvchi turini tanlang</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Davom etish uchun o'zingizga mos bo'limni tanlang
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. STUDENT OPTION */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('STUDENT')}
                  className="group relative p-6 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-emerald-500/80 text-left transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                      Ta'lim oluvchilar
                    </div>
                    <h5 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                      👨‍🎓 O‘QUVCHI
                    </h5>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Dars jadvali, sinf ma'lumotlari, e'lonlar va maktab yangiliklarini ko'rish.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>Kirish</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* 2. ADMIN OPTION */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('ADMIN')}
                  className="group relative p-6 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-amber-500/80 text-left transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                      Maktab ma'muriyati
                    </div>
                    <h5 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                      🔐 ADMIN
                    </h5>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Jadval yuklash, sinflar, o'qituvchilar, yangiliklar va tizim sozlamalarini boshqarish.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-amber-400">
                    <span>Boshqaruv paneli</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              <div className="pt-3 text-center">
                <span className="text-xs text-slate-500">
                  43-maktab xavfsiz axborot portali
                </span>
              </div>
            </div>
          ) : selectedRole === 'STUDENT' ? (
            /* STEP 2A: STUDENT CLASS SELECTOR */
            <form onSubmit={handleStudentSubmit} className="space-y-5">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>O'quvchi portali — Sinfingiz dars jadvali va e'lonlarini ko'rish</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Sinfingizni tanlang:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
                  {CLASS_LIST.map((cls) => {
                    const isSelected = studentClass === cls;
                    return (
                      <button
                        type="button"
                        key={cls}
                        onClick={() => setStudentClass(cls)}
                        className={`py-2 px-3 rounded-xl font-extrabold text-xs transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-105'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                <span>Tanlangan sinf:</span>
                <span className="font-black text-emerald-400 text-sm">{studentClass} sinfi</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{studentClass} sinf jadvalini ko'rish</span>
              </button>
            </form>
          ) : (
            /* STEP 2B: SECURE ADMIN LOGIN FORM */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Administrator boshqaruv tizimiga kirish</span>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Foydalanuvchi nomi (Login)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Loginni kiriting"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Maxfiy parol
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parolni kiriting"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Admin Panelga Kirish</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
