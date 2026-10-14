import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Server, 
  Key, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Save,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';
import { TelegramIcon } from '../../components/TelegramIcon.tsx';
import { formatTelegramUrl } from '../../utils/telegram.ts';

export const AdminSettings: React.FC = () => {
  const { token, user } = useAuth();
  const [reseeding, setReseeding] = useState(false);
  const [showReseedConfirm, setShowReseedConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // School info form state
  const [schoolInfo, setSchoolInfo] = useState({
    name: '43-maktab',
    fullName: 'Farg‘ona viloyati 43-umumiy o‘rta ta’lim maktabi',
    address: '88GG+522, Katput qishlog‘i, Farg‘ona viloyati, O‘zbekiston',
    creator: 'Karimjonov Shuhratjon',
    telegramChannel: 'https://t.me/oltiariq_43_maktab',
    scheduleConfig: {
      firstLessonStartTime: '08:00',
      lessonDurationMinutes: 45,
      shortBreakMinutes: 5,
      longBreakMinutes: 10,
      longBreakInterval: 3,
      totalPeriods: 7,
    },
  });

  // Leadership state
  const [leadership, setLeadership] = useState([
    { id: 'ldr-1', role: 'Maktab direktori', fullName: 'Sheraliyev Axrorbek', bio: '43-umumiy o‘rta ta’lim maktabi direktori' },
    { id: 'ldr-2', role: 'Direktor o‘rinbosari', fullName: 'Boymatov To‘lqinjon', bio: 'O‘quv-tarbiyaviy ishlar bo‘yicha direktor o‘rinbosari' },
    { id: 'ldr-3', role: 'Maktab psixologi', fullName: 'Abdullayev Anvarjon', bio: '43-umumiy o‘rta ta’lim maktabi amaliyotchi psixologi' },
  ]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetch('/api/school')
      .then((res) => res.json())
      .then((data) => {
        if (data.school) {
          setSchoolInfo((prev) => ({
            ...prev,
            ...data.school,
            scheduleConfig: {
              ...prev.scheduleConfig,
              ...(data.school.scheduleConfig || {}),
            },
          }));
        }
        if (Array.isArray(data.leadership)) {
          setLeadership(data.leadership);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSaveSchoolInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/school', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(schoolInfo),
      });

      if (!res.ok) throw new Error('Maktab ma\'lumotlarini yangilashda xatolik yuz berdi.');
      setStatusMsg('Maktab ma\'lumotlari va qo\'ng\'iroqlar jadvali muvaffaqiyatli saqlandi!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi.');
    }
  };

  const handleSaveLeadership = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/school/leadership', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leadership }),
      });

      if (!res.ok) throw new Error('Rahbariyat ma\'lumotlarini yangilashda xatolik yuz berdi.');
      setStatusMsg('Rahbariyat ma\'lumotlari muvaffaqiyatli saqlandi!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('Yangi parol va tasdiqlovchi parol mos kelmadi.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Parol kamida 6 belgidan iborat bo‘lishi lozim.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parolni o‘zgartirishda xatolik yuz berdi.');

      setStatusMsg('Admin paroli muvaffaqiyatli yangilandi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleConfirmReseed = async () => {
    setReseeding(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/reseed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('Baza muvaffaqiyatli qayta tiklandi va tasdiqlangan ma\'lumotlar yuklandi.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi.');
    } finally {
      setReseeding(false);
      setShowReseedConfirm(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          Tizim Sozlamalari va Boshqaruv
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          43-maktab rasmiy ma'lumotlari, qo‘ng‘iroqlar tartibi va administrator xavfsizligi
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. School Information Settings */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-500" />
          Maktab Ma'lumotlari va Manzili
        </h3>

        <form onSubmit={handleSaveSchoolInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Maktab qisqa nomi
              </label>
              <input
                type="text"
                value={schoolInfo.name}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Maktab to‘liq nomi
              </label>
              <input
                type="text"
                value={schoolInfo.fullName}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, fullName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Tasdiqlangan manzil
            </label>
            <input
              type="text"
              value={schoolInfo.address}
              onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Loyiha yaratuvchisi
            </label>
            <input
              type="text"
              value={schoolInfo.creator}
              onChange={(e) => setSchoolInfo({ ...schoolInfo, creator: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-bold"
            />
          </div>

          {/* Telegram Channel Setting */}
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                <TelegramIcon className="w-4 h-4 text-sky-400" />
                Rasmiy Telegram kanali manzili
              </label>
              {schoolInfo.telegramChannel && (
                <a
                  href={formatTelegramUrl(schoolInfo.telegramChannel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline"
                >
                  <span>Kanalni ochish</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <input
              type="text"
              placeholder="masalan: t.me/oltiariq_43_maktab yoki @oltiariq_43_maktab"
              value={schoolInfo.telegramChannel || ''}
              onChange={(e) => setSchoolInfo({ ...schoolInfo, telegramChannel: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
            />
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ushbu Telegram kanal asosiy saytning bosh sahifasi (Hero & Maxsus banner), navigatsiya menyusi, aloqa sahifasi va sayt pastki qismida (footer) ko‘rinadi. Agar kanal manzili kelajakda o‘zgarsa, shu yerdan tahrirlab "Ma'lumotlarni saqlash" tugmasini bosing.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Ma'lumotlarni saqlash
            </button>
          </div>
        </form>
      </div>

      {/* 2. Schedule Config (qo'ng'iroqlar va tanaffus) */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          Dars va Qo‘ng‘iroqlar Tartibi (Markaziy Algoritm)
        </h3>

        <form onSubmit={handleSaveSchoolInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                1-dars boshlanishi
              </label>
              <input
                type="text"
                value={schoolInfo.scheduleConfig.firstLessonStartTime}
                onChange={(e) => setSchoolInfo({
                  ...schoolInfo,
                  scheduleConfig: { ...schoolInfo.scheduleConfig, firstLessonStartTime: e.target.value }
                })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Dars davomiyligi (daqiqa)
              </label>
              <input
                type="number"
                value={schoolInfo.scheduleConfig.lessonDurationMinutes}
                onChange={(e) => setSchoolInfo({
                  ...schoolInfo,
                  scheduleConfig: { ...schoolInfo.scheduleConfig, lessonDurationMinutes: Number(e.target.value) }
                })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Katta tanaffus (daqiqa)
              </label>
              <input
                type="number"
                value={schoolInfo.scheduleConfig.longBreakMinutes}
                onChange={(e) => setSchoolInfo({
                  ...schoolInfo,
                  scheduleConfig: { ...schoolInfo.scheduleConfig, longBreakMinutes: Number(e.target.value) }
                })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs text-slate-300">
            Joriy reja: 1-dars 08:00–08:45, 2-dars 08:50–09:35, 3-dars 09:40–10:25, <strong>Katta tanaffus (10 min)</strong>, 4-dars 10:35–11:20, 5-dars 11:25–12:10, 6-dars 12:15–13:00, 7-dars 13:05–13:50.
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Vaqtlarni saqlash
            </button>
          </div>
        </form>
      </div>

      {/* 3. Leadership Management */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-500" />
          Maktab Rahbariyati
        </h3>

        <form onSubmit={handleSaveLeadership} className="space-y-4">
          {leadership.map((leader, idx) => (
            <div key={leader.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Lavozim</label>
                  <input
                    type="text"
                    value={leader.role}
                    onChange={(e) => {
                      const updated = [...leadership];
                      updated[idx].role = e.target.value;
                      setLeadership(updated);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Ism va familiya</label>
                  <input
                    type="text"
                    value={leader.fullName}
                    onChange={(e) => {
                      const updated = [...leadership];
                      updated[idx].fullName = e.target.value;
                      setLeadership(updated);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Rahbariyatni saqlash
            </button>
          </div>
        </form>
      </div>

      {/* 4. Admin Security / Password Change */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" />
          Admin Parolini O‘zgartirish
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Joriy parol
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Yangi parol
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Yangi parolni takrorlang
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              {passwordLoading ? 'Yangilanmoqda...' : 'Parolni yangilash'}
            </button>
          </div>
        </form>
      </div>

      {/* 5. System Reset / Reseed */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-rose-500" />
          Bazani Qayta Tiklash (Reseed)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Agar bazani barcha 23 ta sinf va tasdiqlangan boshlang‘ich jadval bilan qayta tiklash zarur bo‘lsa, quyidagi tugmadan foydalaning.
        </p>
        <button
          onClick={() => setShowReseedConfirm(true)}
          disabled={reseeding}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
          <span>{reseeding ? 'Tiklanmoqda...' : 'Tasdiqlangan bazani qayta tiklash'}</span>
        </button>
      </div>

      {/* Reseed Confirm Modal */}
      <ConfirmModal
        isOpen={showReseedConfirm}
        title="Bazani qayta tiklashni tasdiqlash"
        message="DIQQAT! Bazani qayta tasdiqlangan boshlang‘ich holatga keltirmoqchimisiz? Barcha kiritilgan sinflar va dars jadvallari tasdiqlangan boshlang'ich ma'lumotlarga qaytariladi."
        confirmLabel="Qayta tiklash"
        onConfirm={handleConfirmReseed}
        onCancel={() => setShowReseedConfirm(false)}
        loading={reseeding}
      />
    </div>
  );
};
