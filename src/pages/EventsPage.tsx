import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { SchoolEvent } from '../types/index.ts';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Calendar className="w-3.5 h-3.5" />
            <span>Maktab Taqvimi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Tadbirlar va Bellashuvlar
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Maktabimizda o'tkazilishi rejalashtirilgan madaniy, sport va ilmiy tadbirlar jadvali.
          </p>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Tadbirlar yuklanmoqda...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-slate-200">
          Rejalashtirilgan tadbirlar mavjud emas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {ev.imageUrl && (
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img
                      src={ev.imageUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {ev.category}
                    </span>
                    <span className="text-xs font-extrabold text-blue-600">
                      {ev.eventDate}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug mb-2">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {ev.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 text-xs text-slate-500 space-y-1.5 mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{ev.startTime} {ev.endTime ? `– ${ev.endTime}` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{ev.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
