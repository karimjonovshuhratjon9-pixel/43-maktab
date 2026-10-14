import React from 'react';
import { GraduationCap, User, BookOpen, Calendar, Bell, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ScheduleView } from '../components/ScheduleView.tsx';

interface StudentPortalPageProps {
  navigate: (route: string) => void;
}

export const StudentPortalPage: React.FC<StudentPortalPageProps> = ({ navigate }) => {
  const { user, studentProfile, logout } = useAuth();

  const studentClass = studentProfile?.className || '8A';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>O'quvchi Shaxsiy Kabineti</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Xush kelibsiz, {user?.fullName || 'O\'quvchi'}!
            </h1>
            <p className="text-sm text-emerald-200">
              Sinf: <strong className="text-white text-base font-black">{studentClass}</strong> | ID: {studentProfile?.studentId || 'ST-001'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('news')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              Yangiliklar
            </button>
            <button
              onClick={() => navigate('announcements')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              E'lonlar
            </button>
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Chiqish
            </button>
          </div>
        </div>
      </div>

      {/* Security notice regarding role limits */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-3">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          O'quvchi rejimi faol. Siz faqat o'z dars jadvalingiz, yangiliklar va e'lonlarni ko'rishingiz mumkin. Admin boshqaruv funksiyalari faqat maktab ma'muriyati uchun cheklangan.
        </span>
      </div>

      {/* Target Timetable for Student's Class */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-emerald-600" />
          <span>{studentClass} sinfi dars jadvali</span>
        </h2>
        <ScheduleView initialClass={studentClass} />
      </div>
    </div>
  );
};
