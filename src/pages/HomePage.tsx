import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Users, 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  ChevronRight,
  ShieldCheck, 
  UserCheck, 
  Bell, 
  Code,
  Image as ImageIcon,
  Trophy,
  ExternalLink,
  Eye,
  X,
  Phone,
  Mail,
  Compass,
  Film,
  Play,
  Video,
  Instagram,
  CheckCircle2
} from 'lucide-react';
import { ScheduleView } from '../components/ScheduleView.tsx';
import { Announcement, Teacher, NewsArticle, GalleryItem, Achievement, SchoolVideo } from '../types/index.ts';
import { InstagramEmbed } from '../components/InstagramEmbed.tsx';
import { TelegramIcon } from '../components/TelegramIcon.tsx';
import { formatTelegramUrl, formatTelegramHandle } from '../utils/telegram.ts';

interface HomePageProps {
  navigate: (route: string) => void;
  openLoginModal: () => void;
}

interface SchoolData {
  school: {
    name: string;
    fullName: string;
    address: string;
    creator: string;
    telegramChannel?: string;
  };
  leadership: {
    id: string;
    role: string;
    fullName: string;
    bio?: string;
  }[];
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, openLoginModal }) => {
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [videos, setVideos] = useState<SchoolVideo[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<SchoolVideo | null>(null);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    // 1. Fetch verified school data
    fetch('/api/school')
      .then((res) => res.json())
      .then((data) => {
        if (data.school) setSchoolData(data);
      })
      .catch((err) => console.error(err));

    // 2. Fetch announcements
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data.slice(0, 3));
      })
      .catch((err) => console.error(err));

    // 3. Fetch latest news
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNews(data.slice(0, 3));
      })
      .catch((err) => console.error(err));

    // 4. Fetch gallery photos
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGallery(data.slice(0, 4));
      })
      .catch((err) => console.error(err));

    // 5. Fetch achievements (Maktabimiz faxrlari)
    fetch('/api/achievements')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAchievements(data.slice(0, 3));
      })
      .catch((err) => console.error(err));

    // 6. Fetch videos (Maktabimiz videolari)
    fetch('/api/videos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVideos(data.slice(0, 3));
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden pt-12 pb-20 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Hero Information */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Farg‘ona viloyati 43-umumiy o‘rta ta’lim maktabi</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Bilim, tarbiya va <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
                  kelajak sari
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                43-maktabning rasmiy axborot portali. Barcha sinflar uchun tasdiqlangan haftalik dars jadvali, qo‘ng‘iroqlar tartibi, rasmiy e’lonlar va o‘quv jarayonlari.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('schedule')}
                  className="px-6 py-3.5 rounded-xl font-extrabold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Dars jadvalini ko‘rish
                </button>
                <button
                  onClick={() => navigate('about')}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
                >
                  Maktab haqida
                </button>
                <a
                  href={formatTelegramUrl(schoolData?.school?.telegramChannel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl font-bold text-sm bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 transition-all flex items-center gap-2"
                >
                  <TelegramIcon className="w-4 h-4 text-sky-400" />
                  <span>Telegram kanalimiz</span>
                </a>
                <button
                  onClick={openLoginModal}
                  className="px-5 py-3.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
                >
                  Kirish tizimi →
                </button>
              </div>

              {/* Verified School Facts */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">23 ta</div>
                  <div className="text-xs text-slate-400 font-medium">Sinflar (1A – 11A)</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-blue-400">6 kun</div>
                  <div className="text-xs text-slate-400 font-medium">Haftalik ta'lim tartibi</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">08:00</div>
                  <div className="text-xs text-slate-400 font-medium">1-dars boshlanish vaqti</div>
                </div>
              </div>
            </div>

            {/* Right Col: Verified School Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Maktab ma'lumotlari</div>
                      <div className="text-sm font-black text-white">43-maktab portali</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Faol
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Rasmiy manzil:</div>
                      <div className="text-slate-400 mt-0.5">
                        88GG+522, Katput qishlog‘i, Farg‘ona viloyati, O‘zbekiston
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Maktab rahbariyati:</div>
                      <div className="text-slate-400 mt-0.5">
                        Direktor: <strong className="text-slate-200">Sheraliyev Axrorbek</strong> <br />
                        Zamdirektor: <strong className="text-slate-200">Boymatov To‘lqinjon</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Code className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Loyiha yaratuvchisi:</div>
                      <div className="text-amber-300 font-bold mt-0.5">
                        Karimjonov Shuhratjon
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <div className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Rasmiy Telegram kanal:</div>
                      <a
                        href={formatTelegramUrl(schoolData?.school?.telegramChannel)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-300 hover:text-sky-200 font-bold mt-0.5 inline-flex items-center gap-1 group"
                      >
                        <span>{formatTelegramHandle(schoolData?.school?.telegramChannel)}</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('schedule')}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Dars jadvali moduliga o‘tish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DARS JADVALI SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Asosiy modul
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dars jadvali
            </h3>
            <p className="text-sm text-slate-500">
              Sinfingizni tanlang va haftalik darslar ro‘yxatini ko‘ring (1A – 11A)
            </p>
          </div>
          <button
            onClick={() => navigate('schedule')}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            To‘liq dars jadvali sahifasi
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded Schedule Widget */}
        <ScheduleView initialClass="8A" />
      </section>

      {/* 3. RASMIY E'LONLAR SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" />
              Axborot
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rasmiy e‘lonlar
            </h3>
          </div>
          <button
            onClick={() => navigate('announcements')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
          >
            Barcha e‘lonlar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-slate-500 border border-slate-200">
            Hozircha rasmiy e‘lonlar kiritilmagan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {ann.category || 'Rasmiy e‘lon'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-lg leading-snug mb-2">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                    {ann.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. YANGILIKLAR SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Maktab Hayoti
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Maktab yangiliklari
            </h3>
          </div>
          <button
            onClick={() => navigate('news')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
          >
            Barcha yangiliklar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {news.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-slate-500 border border-slate-200">
            Hozircha yangiliklar kiritilmagan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`news/${item.slug}`)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={item.coverImage || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                      {item.category || "O'quv jarayoni"}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-slate-400 mb-2">
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                    {item.summary && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mt-2">
                        {item.summary}
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-6 pt-0 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                  <span>Batafsil o'qish</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. MAKTABIMIZ FAXRLARI (School Pride / Honors) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              Iqtidorli yoshlar
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Maktabimiz faxrlari
            </h3>
          </div>
          <button
            onClick={() => navigate('achievements')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
          >
            Barchasini ko'rish
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {achievements.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-slate-500 border border-slate-200">
            Maktabimiz faxrlari ro'yxati admin tomonidan kiritilmoqda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAchievement(item)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.studentName || item.fullName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md">
                      {item.place}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-bold text-blue-600 mb-1">
                      {item.className ? `${item.className} sinf o'quvchisi` : "Maktab faxri"}
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-lg leading-snug">
                      {item.studentName || item.fullName}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      🏆 {item.contest || item.title} ({item.year}-yil)
                    </p>
                    {(item.description || item.achievementDetails) && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {item.description || item.achievementDetails}
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-6 pt-0 text-xs font-bold text-blue-600 flex items-center gap-1">
                  <span>Batafsil ma'lumot</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. MAKTABIMIZ VIDEOLARI (School Videos) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 flex items-center gap-1">
              <Film className="w-3.5 h-3.5" />
              Videolavhalar
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Maktabimiz videolari
            </h3>
          </div>
          <button
            onClick={() => navigate('videos')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
          >
            Barcha videolar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-slate-500 border border-slate-200">
            Maktabimiz videolari ro'yxati admin tomonidan kiritilmoqda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedVideo(item)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
                        {item.videoType === 'instagram' ? (
                          <Instagram className="w-12 h-12 text-pink-500/60" />
                        ) : (
                          <Film className="w-12 h-12 text-indigo-500/60" />
                        )}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/15 flex items-center justify-center transition-all">
                      <div className="w-11 h-11 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                      </div>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md ${
                        item.videoType === 'instagram'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}>
                        {item.videoType === 'instagram' ? (
                          <>
                            <Instagram className="w-3 h-3" />
                            Instagram
                          </>
                        ) : (
                          <>
                            <Video className="w-3 h-3" />
                            Maktab videosi
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-[11px] text-slate-400 mb-1">
                      {new Date(item.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 text-xs font-bold text-indigo-600 flex items-center gap-1">
                  <span>Videoni ko'rish</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. GALEREYA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              Fotolavhalar
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Maktab galereyasi
            </h3>
          </div>
          <button
            onClick={() => navigate('gallery')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
          >
            Barcha fotolavhalar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {gallery.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-slate-500 border border-slate-200">
            Hozircha fotogalereyaga rasmlar kiritilmagan.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedGalleryItem(item)}
                className="group relative h-48 rounded-3xl overflow-hidden bg-slate-900 cursor-pointer shadow-sm hover:shadow-lg transition-all"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                    {item.category || "Maktab"}
                  </span>
                  <h5 className="text-xs font-bold text-white truncate mt-0.5">
                    {item.title}
                  </h5>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6.5. RASMIY TELEGRAM KANALI (Official Telegram Channel Banner) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white p-8 sm:p-12 shadow-2xl border border-sky-400/30">
          {/* Background decor */}
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15 hidden md:block pointer-events-none text-white">
            <TelegramIcon className="w-72 h-72" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-sm">
              <TelegramIcon className="w-4 h-4 text-white" />
              <span>Rasmiy Telegram Kanalimiz</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              43-maktab hayotini Telegramda birinchi bo‘lib kuzating!
            </h3>

            <p className="text-sm sm:text-base text-sky-100 leading-relaxed">
              Barcha rasmiy yangiliklar, dars jadvali yangilanishlari, e'lonlar, fotolavhalar va bayram tabriklari birinchi navbatda rasmiy Telegram kanalimizda e'lon qilib boriladi.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={formatTelegramUrl(schoolData?.school?.telegramChannel)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-sky-50 font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 group"
              >
                <TelegramIcon className="w-5 h-5 text-sky-500" />
                <span>Kanalga a'zo bo‘lish ({formatTelegramHandle(schoolData?.school?.telegramChannel)})</span>
                <ExternalLink className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <span className="text-xs text-sky-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-300" />
                <span>Doimiy yangilanib boruvchi rasmiy manba</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. RAHBARIYAT SECTION */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Tasdiqlangan ma'lumotlar
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Maktab rahbariyati
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              43-umumiy o‘rta ta’lim maktabi ma'muriy tarkibi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Direktor */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center font-black text-xl">
                SA
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                  Maktab direktori
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-1">
                  Sheraliyev Axrorbek
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  43-umumiy o‘rta ta’lim maktabi direktori
                </p>
              </div>
            </div>

            {/* Zamdirektor */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-black text-xl">
                BT
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                  Direktor o‘rinbosari
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-1">
                  Boymatov To‘lqinjon
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  O‘quv-tarbiyaviy ishlar bo‘yicha direktor o‘rinbosari
                </p>
              </div>
            </div>

            {/* Muallif */}
            <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm text-center space-y-3 bg-gradient-to-b from-amber-50/40 to-white">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center font-black text-xl">
                KS
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                  Loyiha yaratuvchisi
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-1">
                  Karimjonov Shuhratjon
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Maktab rasmiy elektron platformasi muallifi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. XARITA VA RASMIY MANZIL SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            Geolokatsiya
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Maktab joylashuvi va xarita
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Katput qishlog‘i, Farg‘ona viloyati hududidagi 43-maktab binosi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map display (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-200 min-h-[320px] relative">
            <iframe
              title="43-Maktab xaritasi"
              src="https://maps.google.com/maps?q=88GG%2B522+Katput+Fergana&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full min-h-[320px] border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>

          {/* Address card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Rasmiy manzil:</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed font-semibold">
                    88GG+522, Katput qishlog‘i, Farg‘ona viloyati, O‘zbekiston
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Google Plus Code:</span>
                  <span className="font-mono font-bold text-blue-600">88GG+522</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Hudud:</span>
                  <span>Katput qishlog‘i</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Viloyat:</span>
                  <span>Farg‘ona viloyati</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=88GG%2B522+Katput+Fergana"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Google Maps'da ochish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => navigate('contact')}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                Murojaat va aloqa sahifasiga o'tish
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. QUICK CONTACT CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black">
              43-maktab bilan bog‘lanish
            </h3>
            <p className="text-sm text-blue-200 leading-relaxed flex items-start gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
              <span>
                88GG+522, Katput qishlog‘i, Farg‘ona viloyati, O‘zbekiston
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('contact')}
              className="px-6 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm shadow-lg transition-all"
            >
              Murojaat yuborish
            </button>
            <button
              onClick={() => navigate('about')}
              className="px-6 py-3.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-bold text-sm border border-blue-400/30 transition-all"
            >
              Maktab haqida
            </button>
          </div>
        </div>
      </section>

      {/* Lightbox / Detail Modals */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedAchievement(null)} />
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Maktabimiz faxri
                </span>
              </div>
              <button onClick={() => setSelectedAchievement(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={selectedAchievement.imageUrl}
                alt={selectedAchievement.studentName}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shrink-0"
              />
              <div>
                <h4 className="text-lg font-black text-white">{selectedAchievement.studentName}</h4>
                <div className="text-xs font-bold text-blue-400 mt-0.5">{selectedAchievement.className} sinf o'quvchisi</div>
                <div className="text-xs text-amber-400 font-bold mt-1">🏆 {selectedAchievement.place} ({selectedAchievement.year}-yil)</div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700/70 text-xs text-slate-200 leading-relaxed">
              <div className="font-bold text-white mb-1">{selectedAchievement.contest}</div>
              {selectedAchievement.description}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAchievement(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setSelectedVideo(null)} />
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-6 text-white z-10 shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                selectedVideo.videoType === 'instagram'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                  : 'bg-indigo-600 text-white'
              }`}>
                {selectedVideo.videoType === 'instagram' ? 'Instagram Video' : 'Maktab videosi'}
              </span>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Display */}
            {selectedVideo.videoType === 'instagram' ? (
              <div className="w-full">
                <InstagramEmbed url={selectedVideo.videoUrl} title={selectedVideo.title} minHeight="520px" />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  poster={selectedVideo.thumbnailUrl}
                  className="w-full h-full object-contain"
                >
                  Sizning brauzeringiz ushbu videoni ijro eta olmaydi.
                </video>
              </div>
            )}

            <div>
              <h3 className="text-lg font-black text-white">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedVideo.description}
                </p>
              )}
              <div className="text-[11px] text-slate-500 mt-2">
                Yuklangan sana: {new Date(selectedVideo.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedGalleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedGalleryItem(null)} />
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {selectedGalleryItem.category || "Maktab"}
              </span>
              <button onClick={() => setSelectedGalleryItem(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={selectedGalleryItem.imageUrl}
              alt={selectedGalleryItem.title}
              className="w-full max-h-96 object-contain rounded-2xl bg-black/40"
            />
            <div>
              <h3 className="text-lg font-black text-white">{selectedGalleryItem.title}</h3>
              {selectedGalleryItem.description && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedGalleryItem.description}</p>
              )}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedGalleryItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
