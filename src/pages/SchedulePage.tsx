import React from 'react';
import { Calendar, Download, Sparkles, AlertCircle } from 'lucide-react';
import { ScheduleView } from '../components/ScheduleView.tsx';

interface SchedulePageProps {
  initialClass?: string;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ initialClass = '8A' }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Elektron Dars Jadvali Moduli</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            43-Maktab — Dars Jadvali
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Quyidagi bo'limdan o'z sinfingizni tanlang. Tizim tanlangan sinf uchun haftalik darslar ro'yxatini va bugungi kun bo'yicha dars jarayonlarini real vaqtda aniqlab ko'rsatadi.
          </p>
        </div>
      </div>

      {/* Main Interactive Timetable */}
      <ScheduleView initialClass={initialClass} />

      {/* Instructional Info Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 text-slate-600 text-xs sm:text-sm flex items-start gap-4 shadow-sm">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-bold text-slate-900">Eslatma o'quvchilar va ota-onalar uchun:</h5>
          <p>
            Darslar 1-smena uchun soat 08:00 dan, 2-smena uchun soat 13:30 dan boshlanadi. Har bir dars davomiyligi 45 daqiqa. Dars jadvalidagi har qanday o'zgarishlar maktab o'quv ishlari bo'limi tomonidan avtomatik ravishda yangilanadi.
          </p>
        </div>
      </div>
    </div>
  );
};
