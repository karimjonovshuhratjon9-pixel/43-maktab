import React, { useState, useEffect } from 'react';
import { Bell, Pin, Calendar, Users, AlertCircle } from 'lucide-react';
import { Announcement } from '../types/index.ts';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <Bell className="w-3.5 h-3.5" />
            <span>Rasmiy bildirishnomalar</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Muhim E'lonlar
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Maktab o'quvchilari, ota-onalar va o'qituvchilar uchun tasdiqlangan tezkor xabarlar va e'lonlar.
          </p>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          E'lonlar yuklanmoqda...
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-slate-200">
          Hozirda faol e'lonlar mavjud emas.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                item.isPinned
                  ? 'bg-amber-50/40 border-amber-200 shadow-sm ring-1 ring-amber-400/20'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.isPinned && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 shadow-sm">
                      <Pin className="w-3.5 h-3.5" />
                      Muhim e'lon
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    Mo'ljallangan: <strong className="text-slate-800 uppercase">{item.targetAudience === 'all' ? 'Barcha uchun' : item.targetAudience}</strong>
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                {item.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>

              {item.expiryDate && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-1">
                  <span>Amal qilish muddati:</span>
                  <strong className="text-slate-600">{item.expiryDate}</strong> gacha
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
