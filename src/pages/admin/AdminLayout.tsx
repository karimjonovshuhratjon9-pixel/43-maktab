import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Bell, 
  CalendarDays, 
  Award, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight,
  Film
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export type AdminTab = 
  | 'dashboard' 
  | 'schedule' 
  | 'classes' 
  | 'teachers' 
  | 'achievements'
  | 'videos'
  | 'news' 
  | 'announcements' 
  | 'gallery' 
  | 'messages' 
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  setTab: (tab: AdminTab) => void;
  navigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  currentTab, 
  setTab, 
  navigateHome, 
  children 
}) => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Boshqaruv paneli', icon: LayoutDashboard },
    { id: 'schedule', label: 'Dars jadvali', icon: Calendar },
    { id: 'classes', label: 'Sinflar', icon: BookOpen },
    { id: 'teachers', label: 'O‘qituvchilar', icon: Users },
    { id: 'achievements', label: 'Maktabimiz faxrlari', icon: Award },
    { id: 'videos', label: 'Maktabimiz videolari', icon: Film },
    { id: 'news', label: 'Yangiliklar', icon: Bell },
    { id: 'announcements', label: 'E‘lonlar', icon: Bell },
    { id: 'gallery', label: 'Galereya', icon: ImageIcon },
    { id: 'messages', label: 'Murojaatlar', icon: MessageSquare },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-sm text-white">43-Maktab Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between transition-transform duration-200
        md:static md:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Logo / Admin Header */}
          <div className="px-2 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white leading-tight">43-Maktab</h3>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Admin Card */}
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs">
            <div className="text-slate-400">Faol administrator:</div>
            <div className="font-extrabold text-white truncate mt-0.5">{user?.fullName || 'Bosh Admin'}</div>
            <div className="text-[11px] text-amber-400 font-mono mt-0.5">@{user?.username}</div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin pr-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer controls: Back to site & Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={navigateHome}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Maktab saytiga o'tish
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Tizimdan chiqish
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
};
