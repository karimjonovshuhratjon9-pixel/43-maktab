import React, { useState, useEffect } from 'react';
import { Award, Trophy, Search, ChevronRight, X } from 'lucide-react';
import { Achievement } from '../types/index.ts';

export const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<Achievement | null>(null);

  useEffect(() => {
    fetch('/api/achievements')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAchievements(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = achievements.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (a.studentName || a.fullName || '').toLowerCase();
    const contest = (a.contest || a.title || '').toLowerCase();
    const cls = (a.className || '').toLowerCase();
    const place = (a.place || '').toLowerCase();
    const desc = (a.description || a.achievementDetails || '').toLowerCase();
    return name.includes(q) || contest.includes(q) || cls.includes(q) || place.includes(q) || desc.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>Iqtidorli O'quvchilarimiz</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Maktabimiz Faxrlari
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Respublika, viloyat va xalqaro fan olimpiadalari, sport musobaqalari va intellektual tanlovlarda g'olib bo'lgan iqtidorli o'quvchilarimiz.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, sinf yoki yutuq bo'yicha qidiruv..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
          Topildi: <strong className="text-blue-600">{filtered.length} nafar</strong> faxrli inson
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Ma'lumotlar yuklanmoqda...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-slate-200">
          {search ? "Qidiruv bo'yicha hech qanday ma'lumot topilmadi." : "Hozircha maktabimiz faxrlari ro'yxati kiritilmagan."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="relative h-56 bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.studentName || item.fullName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-3 right-3 px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-400 text-slate-950 shadow-md">
                    {item.place}
                  </span>
                </div>

                <div className="p-6">
                  <div className="text-xs font-bold text-blue-600 mb-1">
                    {item.className ? `${item.className} sinf` : ''} • {item.year}-yil
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-xl mb-1 group-hover:text-blue-600 transition-colors">
                    {item.studentName}
                  </h3>
                  <div className="font-semibold text-slate-700 text-sm mb-3">
                    🏆 {item.contest}
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-1 text-xs font-bold text-blue-600">
                <span>Batafsil ma'lumot</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                Maktabimiz Faxri
              </span>
              <button onClick={() => setSelectedItem(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.studentName}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div>
                <h4 className="text-xl font-black text-slate-900">{selectedItem.studentName}</h4>
                <div className="text-xs font-bold text-blue-600 mt-0.5">{selectedItem.className} sinf o'quvchisi</div>
                <div className="text-xs font-bold text-amber-600 mt-1">🏆 {selectedItem.place} ({selectedItem.year}-yil)</div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
              <div className="font-bold text-slate-900 text-sm">{selectedItem.contest}</div>
              <p className="mt-1">{selectedItem.description}</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
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
