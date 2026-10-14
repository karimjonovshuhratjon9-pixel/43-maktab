import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { SchedulePage } from './pages/SchedulePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { TeachersPage } from './pages/TeachersPage.tsx';
import { NewsPage } from './pages/NewsPage.tsx';
import { NewsDetailPage } from './pages/NewsDetailPage.tsx';
import { AnnouncementsPage } from './pages/AnnouncementsPage.tsx';
import { EventsPage } from './pages/EventsPage.tsx';
import { AchievementsPage } from './pages/AchievementsPage.tsx';
import { VideosPage } from './pages/VideosPage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { StudentPortalPage } from './pages/StudentPortalPage.tsx';

// Admin modules
import { AdminLayout, AdminTab } from './pages/admin/AdminLayout.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminSchedule } from './pages/admin/AdminSchedule.tsx';
import { AdminClasses } from './pages/admin/AdminClasses.tsx';
import { AdminStudents } from './pages/admin/AdminStudents.tsx';
import { AdminTeachers } from './pages/admin/AdminTeachers.tsx';
import { AdminNews } from './pages/admin/AdminNews.tsx';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements.tsx';
import { AdminEvents } from './pages/admin/AdminEvents.tsx';
import { AdminAchievements } from './pages/admin/AdminAchievements.tsx';
import { AdminVideos } from './pages/admin/AdminVideos.tsx';
import { AdminGallery } from './pages/admin/AdminGallery.tsx';
import { AdminMessages } from './pages/admin/AdminMessages.tsx';
import { AdminSettings } from './pages/admin/AdminSettings.tsx';

import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { UserRole, SchoolInfo } from './types/index.ts';

function AppContent() {
  const { user, isAdmin, isStudent } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname.replace(/^\//, '');
    return path || 'home';
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);

  // Fetch verified school information (including telegram channel)
  useEffect(() => {
    fetch('/api/school')
      .then((res) => res.json())
      .then((data) => {
        if (data.school) {
          setSchoolInfo(data.school);
        }
      })
      .catch((err) => console.error('Failed to load school info:', err));
  }, [currentRoute]); // refetch when navigating between admin and public pages

  // Sync with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      setCurrentRoute(path || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetPath = route === 'home' ? '/' : `/${route}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const handleLoginSuccess = (role: UserRole, targetClass?: string) => {
    if (role === 'ADMIN') {
      navigate('admin');
      setAdminTab('dashboard');
    } else {
      if (targetClass) {
        navigate(`schedule?class=${encodeURIComponent(targetClass)}`);
      } else {
        navigate('schedule');
      }
    }
  };

  // Route: Admin
  if (currentRoute === 'admin' || currentRoute.startsWith('admin/')) {
    if (!user || !isAdmin) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">403 — Kirish Taqiqlangan</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Administrator paneli faqat vakolatli maktab ma'muriyati uchun ruxsat etilgan. Davom etish uchun Admin sifatida tizimga kiring.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Admin sifatida kirish
              </button>
              <button
                onClick={() => navigate('home')}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Bosh sahifaga qaytish
              </button>
            </div>
          </div>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSuccess={handleLoginSuccess}
          />
        </div>
      );
    }

    // Render Admin Workspace
    return (
      <AdminLayout
        currentTab={adminTab}
        setTab={setAdminTab}
        navigateHome={() => navigate('home')}
      >
        {adminTab === 'dashboard' && <AdminDashboard setTab={setAdminTab} />}
        {adminTab === 'schedule' && <AdminSchedule />}
        {adminTab === 'classes' && <AdminClasses />}
        {adminTab === 'teachers' && <AdminTeachers />}
        {adminTab === 'achievements' && <AdminAchievements />}
        {adminTab === 'videos' && <AdminVideos />}
        {adminTab === 'news' && <AdminNews />}
        {adminTab === 'announcements' && <AdminAnnouncements />}
        {adminTab === 'gallery' && <AdminGallery />}
        {adminTab === 'messages' && <AdminMessages />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // Handle Dynamic news slug
  const isNewsDetail = currentRoute.startsWith('news/');
  const newsSlug = isNewsDetail ? currentRoute.replace('news/', '') : null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        openLoginModal={() => setIsLoginModalOpen(true)}
        telegramChannel={schoolInfo?.telegramChannel}
      />

      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomePage navigate={navigate} openLoginModal={() => setIsLoginModalOpen(true)} />
        )}
        {currentRoute === 'schedule' && <SchedulePage initialClass="8A" />}
        {currentRoute === 'about' && <AboutPage />}
        {currentRoute === 'teachers' && <TeachersPage />}
        {currentRoute === 'news' && <NewsPage navigate={navigate} />}
        {isNewsDetail && newsSlug && (
          <NewsDetailPage slug={newsSlug} navigate={navigate} />
        )}
        {currentRoute === 'announcements' && <AnnouncementsPage />}
        {currentRoute === 'events' && <EventsPage />}
        {currentRoute === 'achievements' && <AchievementsPage />}
        {currentRoute === 'videos' && <VideosPage />}
        {currentRoute === 'gallery' && <GalleryPage />}
        {currentRoute === 'contact' && <ContactPage />}
        {currentRoute === 'student' && <StudentPortalPage navigate={navigate} />}
      </main>

      <Footer navigate={navigate} telegramChannel={schoolInfo?.telegramChannel} />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
