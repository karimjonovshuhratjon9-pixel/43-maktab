import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Menu, 
  X, 
  Calendar, 
  BookOpen, 
  Users, 
  Bell, 
  Award, 
  Image as ImageIcon, 
  Phone, 
  LogIn, 
  LogOut,
  ChevronRight,
  User as UserIcon,
  Film
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

import { TelegramIcon } from './TelegramIcon.tsx';
import { formatTelegramUrl, formatTelegramHandle } from '../utils/telegram.ts';
import { ExternalLink } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openLoginModal: () => void;
  telegramChannel?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, openLoginModal, telegramChannel }) => {
  const { user, isAdmin, isStudent, studentProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Bosh sahifa', route: 'home', icon: BookOpen },
    { label: 'Dars jadvali', route: 'schedule', icon: Calendar, highlight: true },
    { label: 'Maktab haqida', route: 'about', icon: Users },
    { label: 'O‘qituvchilar', route: 'teachers', icon: Users },
    { label: 'Maktab faxrlari', route: 'achievements', icon: Award },
    { label: 'Videolar', route: 'videos', icon: Film },
    { label: 'Yangiliklar', route: 'news', icon: Bell },
    { label: 'E‘lonlar', route: 'announcements', icon: Bell },
    { label: 'Galereya', route: 'gallery', icon: ImageIcon },
    { label: 'Aloqa', route: 'contact', icon: Phone },
  ];

  const handleNavClick = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 border border-blue-400/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  43-MAKTAB
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                    Rasmiy
                  </span>
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Bilim, tarbiya va kelajak sari
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => {
                const isActive = currentRoute === link.route;
                return (
                  <button
                    key={link.route}
                    onClick={() => handleNavClick(link.route)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : link.highlight
                        ? 'text-blue-400 hover:text-white hover:bg-slate-800 font-bold border border-blue-500/30 bg-blue-950/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* User Auth Controls & Telegram */}
            <div className="hidden lg:flex items-center gap-2.5">
              <a
                href={formatTelegramUrl(telegramChannel)}
                target="_blank"
                rel="noopener noreferrer"
                title="Rasmiy Telegram kanalga ulanish"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-white text-xs font-bold border border-sky-500/30 transition-all shadow-sm"
              >
                <TelegramIcon className="w-4 h-4 text-sky-400" />
                <span className="hidden xl:inline">TG Kanal:</span>
                <span>{formatTelegramHandle(telegramChannel)}</span>
                <ExternalLink className="w-3 h-3 text-sky-400" />
              </a>

              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold border transition-all ${
                        currentRoute.startsWith('admin')
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      Admin Panel
                    </button>
                  )}

                  {isStudent && (
                    <button
                      onClick={() => handleNavClick('student')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold border transition-all ${
                        currentRoute === 'student'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/30'
                          : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/40'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span>{studentProfile?.className || 'O\'quvchi'}</span>
                    </button>
                  )}

                  <button
                    onClick={logout}
                    title="Chiqish"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  Kirish
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              {!user && (
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Kirish
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menyu ochish"
                className="p-2.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-slate-700 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-white text-lg">43-MAKTAB</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User status card in mobile drawer */}
              {user && (
                <div className="my-4 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      {user.role === 'ADMIN' ? 'A' : 'O'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white leading-tight">{user.fullName}</div>
                      <div className="text-xs text-slate-400">
                        {user.role === 'ADMIN' ? 'Administrator' : `${studentProfile?.className || ''} o'quvchisi`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    title="Chiqish"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Main navigation list */}
              <div className="mt-4 space-y-1">
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-amber-300 bg-amber-950/40 border border-amber-600/30 text-sm font-bold"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <span>Admin Panelga o'tish</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                )}

                {user?.role === 'STUDENT' && (
                  <button
                    onClick={() => handleNavClick('student')}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-emerald-300 bg-emerald-950/40 border border-emerald-600/30 text-sm font-bold"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                      <span>Mening kabinetim ({studentProfile?.className})</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-400" />
                  </button>
                )}

                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = currentRoute === link.route;
                  return (
                    <button
                      key={link.route}
                      onClick={() => handleNavClick(link.route)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-md'
                          : link.highlight
                          ? 'bg-blue-950/40 text-blue-300 border border-blue-500/30 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 pb-2">
              <a
                href={formatTelegramUrl(telegramChannel)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-bold text-xs transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <TelegramIcon className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Telegram: {formatTelegramHandle(telegramChannel)}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              </a>
            </div>

            <div className="pt-4 border-t border-slate-800">
              {!user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30"
                >
                  <LogIn className="w-4 h-4" />
                  Tizimga kirish
                </button>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 text-rose-400 font-bold text-sm border border-slate-700 hover:bg-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                  Hisobdan chiqish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
