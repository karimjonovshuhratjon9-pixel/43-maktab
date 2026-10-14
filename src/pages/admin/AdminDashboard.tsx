import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Bell, 
  CalendarDays, 
  MessageSquare, 
  Activity, 
  Upload, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { AdminStats, ActivityLog } from '../../types/index.ts';
import { AdminTab } from './AdminLayout.tsx';

interface AdminDashboardProps {
  setTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setTab }) => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/activity-logs', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Boshqaruv Markazi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Assalomu alaykum, {user?.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Bugun dars jadvallari, o'quvchilar, yangiliklar va murojaatlarni boshqarishingiz mumkin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setTab('schedule')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              Excel Jadval Yuklash
            </button>
            <button
              onClick={() => setTab('news')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Yangilik qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div 
          onClick={() => setTab('classes')}
          className="bg-slate-900 hover:bg-slate-850 p-5 rounded-3xl border border-slate-800 shadow-sm cursor-pointer transition-all hover:border-slate-700 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-blue-400">Ko'rish →</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? '...' : stats?.totalClasses || 23}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">Sinflar (1A – 11A)</div>
        </div>

        <div 
          onClick={() => setTab('teachers')}
          className="bg-slate-900 hover:bg-slate-850 p-5 rounded-3xl border border-slate-800 shadow-sm cursor-pointer transition-all hover:border-slate-700 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-400">Ko'rish →</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? '...' : stats?.totalTeachers || 0}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">O‘qituvchilar</div>
        </div>

        <div 
          onClick={() => setTab('announcements')}
          className="bg-slate-900 hover:bg-slate-850 p-5 rounded-3xl border border-slate-800 shadow-sm cursor-pointer transition-all hover:border-slate-700 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-amber-400">Ko'rish →</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? '...' : stats?.totalAnnouncements || 0}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">E‘lonlar</div>
        </div>

        <div 
          onClick={() => setTab('messages')}
          className="bg-slate-900 hover:bg-slate-850 p-5 rounded-3xl border border-slate-800 shadow-sm cursor-pointer transition-all hover:border-slate-700 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            {stats?.unreadMessages && stats.unreadMessages > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {stats.unreadMessages} yangi
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-purple-400">Ko'rish →</span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? '...' : stats?.totalMessages || 0}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">Murojaatlar</div>
        </div>
      </div>

      {/* Secondary Metrics & Active Schedule Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Faol Dars Jadvali Holati
            </h3>
            <button
              onClick={() => setTab('schedule')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              Jadvalni boshqarish →
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-semibold">Amaldagi versiya:</div>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                {stats?.activeScheduleVersion || 'Boshlang\'ich dars jadvali'}
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Barcha 23 ta sinf uchun darslar faoliyatda
              </div>
            </div>

            <button
              onClick={() => setTab('schedule')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 shadow-md"
            >
              Excel yangilash
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
            <div 
              onClick={() => setTab('news')}
              className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
            >
              <div className="font-bold text-white text-base">{stats?.totalNews || 0}</div>
              <div className="text-slate-400 mt-0.5">Yangiliklar</div>
            </div>
            <div 
              onClick={() => setTab('announcements')}
              className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
            >
              <div className="font-bold text-white text-base">{stats?.totalAnnouncements || 0}</div>
              <div className="text-slate-400 mt-0.5">E‘lonlar</div>
            </div>
            <div 
              onClick={() => setTab('achievements')}
              className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
            >
              <div className="font-bold text-amber-400 text-base">{stats?.totalAchievements || 0}</div>
              <div className="text-slate-400 mt-0.5">Maktab faxrlari</div>
            </div>
            <div 
              onClick={() => setTab('videos')}
              className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
            >
              <div className="font-bold text-indigo-400 text-base">{stats?.totalVideos || 0}</div>
              <div className="text-slate-400 mt-0.5">Videolar</div>
            </div>
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-base text-white">Tezkor amallar</h3>
          <div className="space-y-2">
            <button
              onClick={() => setTab('achievements')}
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 border border-slate-700/60 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Maktabimiz faxrlarini boshqarish
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => setTab('videos')}
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 border border-slate-700/60 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Maktabimiz videolarini boshqarish
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => setTab('schedule')}
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 border border-slate-700/60 flex items-center justify-between cursor-pointer"
            >
              <span>Dars jadvalini boshqarish</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => setTab('teachers')}
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 border border-slate-700/60 flex items-center justify-between cursor-pointer"
            >
              <span>O'qituvchilar ro'yxati</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            Oxirgi Admin Harakatlari Tarixi
          </h3>
          <span className="text-xs text-slate-500">Xavfsizlik auditi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Vaqt</th>
                <th className="py-3 px-3">Admin</th>
                <th className="py-3 px-3">Harakat</th>
                <th className="py-3 px-3">Batafsil ma'lumot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    Harakatlar tarixi bo'sh.
                  </td>
                </tr>
              ) : (
                logs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 whitespace-nowrap text-slate-400">
                      {new Date(log.timestamp).toLocaleString('uz-UZ')}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {log.adminUsername}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-[11px] text-amber-300 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
