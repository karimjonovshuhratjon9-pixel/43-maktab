import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Search, 
  Play, 
  Instagram, 
  Video, 
  X, 
  ExternalLink, 
  Calendar,
  Sparkles 
} from 'lucide-react';
import { SchoolVideo } from '../types/index.ts';
import { InstagramEmbed } from '../components/InstagramEmbed.tsx';

export const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<SchoolVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'upload' | 'instagram'>('all');
  const [activeVideo, setActiveVideo] = useState<SchoolVideo | null>(null);

  useEffect(() => {
    fetch('/api/videos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVideos(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = videos.filter((v) => {
    if (typeFilter !== 'all' && v.videoType !== typeFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Film className="w-3.5 h-3.5" />
            <span>Videolavhalar</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Maktabimiz Videolari
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Maktabimizda o‘tkazilgan bayram tadbirlari, ochiq darslar, intellektual bellashuvlar va rasmiy videolavhalar to‘plami.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Video nomi yoki mavzusi bo'yicha qidiruv..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setTypeFilter('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maktab videolari
            </button>
            <button
              onClick={() => setTypeFilter('instagram')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'instagram' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Instagram
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
          Topildi: <strong className="text-indigo-600">{filtered.length} ta</strong> video
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Videolar yuklanmoqda...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-slate-200 space-y-2">
          <Film className="w-10 h-10 mx-auto text-slate-400" />
          <p className="text-base font-bold text-slate-700">
            {search ? "Qidiruv bo'yicha hech qanday video topilmadi." : "Hozircha maktab videolari kiritilmagan."}
          </p>
          <p className="text-xs text-slate-400">
            Yangi videolavhalar tez orada maktab ma'muriyati tomonidan joylashtiriladi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveVideo(item)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Thumbnail Container */}
                <div className="relative h-52 bg-slate-950 flex items-center justify-center overflow-hidden">
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
                        <Instagram className="w-14 h-14 text-pink-500/60" />
                      ) : (
                        <Film className="w-14 h-14 text-indigo-500/60" />
                      )}
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 flex items-center justify-center transition-all">
                    <div className="w-12 h-12 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-115 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-current text-slate-950" />
                    </div>
                  </div>

                  {/* Badge */}
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
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mt-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                <Play className="w-3 h-3 fill-current" />
                <span>Videoni ko'rish</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setActiveVideo(null)} />
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-6 text-white z-10 shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                activeVideo.videoType === 'instagram'
                  ? 'bg-pink-600 text-white'
                  : 'bg-indigo-600 text-white'
              }`}>
                {activeVideo.videoType === 'instagram' ? 'Instagram Video' : 'Maktab videosi'}
              </span>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Display */}
            {activeVideo.videoType === 'instagram' ? (
              <div className="w-full">
                <InstagramEmbed url={activeVideo.videoUrl} title={activeVideo.title} minHeight="520px" />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  poster={activeVideo.thumbnailUrl}
                  className="w-full h-full object-contain"
                >
                  Sizning brauzeringiz ushbu videoni ijro eta olmaydi.
                </video>
              </div>
            )}

            <div>
              <h3 className="text-lg font-black text-white">{activeVideo.title}</h3>
              {activeVideo.description && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activeVideo.description}
                </p>
              )}
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  Yuklangan sana: {new Date(activeVideo.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveVideo(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
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
