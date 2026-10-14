import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  User, 
  MapPin, 
  Sparkles, 
  Download, 
  Filter, 
  CheckCircle, 
  AlertCircle,
  Flame,
  ChevronDown,
  Layers
} from 'lucide-react';
import { ScheduleItem, WeekDay, SchoolClass } from '../types/index.ts';

interface TodayResponse {
  className: string;
  currentDay: WeekDay;
  dayName: string;
  isSunday: boolean;
  isWeekendNotice: string | null;
  currentTime: string;
  currentLesson: ScheduleItem | null;
  nextLesson: ScheduleItem | null;
  isBreak?: boolean;
  breakLabel?: string;
  breakRemainingMinutes?: number;
  lessons: (ScheduleItem & { status: 'past' | 'current' | 'upcoming' })[];
}

interface ScheduleViewProps {
  initialClass?: string;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ initialClass = '8A' }) => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlClass = params.get('class');
      if (urlClass) return urlClass;
    }
    return initialClass;
  });
  const [viewMode, setViewMode] = useState<'weekly' | 'today'>('weekly');
  const [selectedDayMobile, setSelectedDayMobile] = useState<WeekDay>('Du');

  // Weekly data
  const [weeklySchedules, setWeeklySchedules] = useState<ScheduleItem[]>([]);
  const [scheduleVersionTitle, setScheduleVersionTitle] = useState<string>('');
  const [loadingWeekly, setLoadingWeekly] = useState<boolean>(true);

  // Today's data
  const [todayData, setTodayData] = useState<TodayResponse | null>(null);
  const [loadingToday, setLoadingToday] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const days: { key: WeekDay; label: string; short: string }[] = [
    { key: 'Du', label: 'Dushanba', short: 'Dush' },
    { key: 'Se', label: 'Seshanba', short: 'Sesh' },
    { key: 'Ch', label: 'Chorshanba', short: 'Chor' },
    { key: 'Pa', label: 'Payshanba', short: 'Pay' },
    { key: 'Ju', label: 'Juma', short: 'Jum' },
    { key: 'Sh', label: 'Shanba', short: 'Shan' },
  ];

  // Exactly calculated with 10 min break after 3rd lesson
  const periods = [
    { num: 1, time: '08:00–08:45' },
    { num: 2, time: '08:50–09:35' },
    { num: 3, time: '09:40–10:25' },
    { num: 4, time: '10:35–11:20' },
    { num: 5, time: '11:25–12:10' },
    { num: 6, time: '12:15–13:00' },
    { num: 7, time: '13:05–13:50' },
  ];

  // Fetch classes on mount
  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClasses(data);
          // If initialClass not in list, fallback to first
          if (!data.some((c) => c.name === initialClass) && data.length > 0) {
            setSelectedClass(data[0].name);
          }
        }
      })
      .catch((err) => console.error('Error fetching classes:', err));
  }, [initialClass]);

  // Fetch weekly schedule for targeted class
  useEffect(() => {
    if (!selectedClass) return;

    setLoadingWeekly(true);
    setError(null);

    fetch(`/api/schedule?class=${encodeURIComponent(selectedClass)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Jadvalni yuklashda xatolik yuz berdi.');
        return res.json();
      })
      .then((data) => {
        setWeeklySchedules(data.schedule || []);
        if (data.version) {
          setScheduleVersionTitle(data.version.title);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoadingWeekly(false);
      });
  }, [selectedClass]);

  // Fetch today's schedule when viewing 'today' or on class switch, with periodic tick
  useEffect(() => {
    if (!selectedClass || viewMode !== 'today') return;

    const fetchToday = () => {
      const now = new Date();
      const clientTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      fetch(`/api/schedule/today?class=${encodeURIComponent(selectedClass)}&clientTime=${clientTime}`)
        .then((res) => res.json())
        .then((data) => {
          setTodayData(data);
          if (data.currentDay) {
            setSelectedDayMobile(data.currentDay);
          }
        })
        .catch((err) => console.error('Error fetching today schedule:', err))
        .finally(() => setLoadingToday(false));
    };

    setLoadingToday(true);
    fetchToday();

    // Auto-refresh every 20 seconds so status and live clock stay accurate
    const interval = setInterval(fetchToday, 20000);
    return () => clearInterval(interval);
  }, [selectedClass, viewMode]);

  // Group weekly schedule by day & period for rapid O(1) lookup
  const scheduleMatrix: Record<string, ScheduleItem | undefined> = {};
  weeklySchedules.forEach((item) => {
    scheduleMatrix[`${item.day}_${item.period}`] = item;
  });

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tasdiqlangan dars jadvali</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{selectedClass}-sinf</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-slate-700 font-bold text-xl sm:text-2xl">
                {viewMode === 'weekly' ? 'Haftalik dars jadvali' : 'Bugungi darslar'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {scheduleVersionTitle || '2026-2027 o\'quv yili 1-chorak asosiy dars jadvali'}
            </p>
          </div>

          {/* View mode toggle & Template download */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('weekly')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'weekly'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Haftalik jadval
              </button>
              <button
                type="button"
                onClick={() => setViewMode('today')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'today'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-300" />
                Bugun
              </button>
            </div>

            <a
              href="/api/schedule/template"
              download
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm transition-all"
              title="Excel formatida yuklab olish"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Excel namuna</span>
            </a>
          </div>
        </div>

        {/* CLASS SELECTOR SECTION */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Sinfni tanlang:
            </label>
            <span className="text-xs text-slate-400">Jami {classes.length} ta sinf</span>
          </div>

          {/* Quick Class Pills (Horizontal scrollable, touch-friendly) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {classes.map((cls) => {
              const isSelected = selectedClass === cls.name;
              return (
                <button
                  key={cls.name}
                  type="button"
                  onClick={() => setSelectedClass(cls.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-150 select-none ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-105'
                      : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border border-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cls.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MAIN VIEW CONTENT */}
      {viewMode === 'weekly' ? (
        /* WEEKLY TIMETABLE */
        <div className="space-y-4">
          {/* Desktop Table View (>= 1024px) */}
          <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                    <th className="py-4 px-4 w-12 text-center">№</th>
                    <th className="py-4 px-4 w-32">Vaqt</th>
                    {days.map((d) => (
                      <th key={d.key} className="py-4 px-4 font-extrabold text-blue-200">
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loadingWeekly ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="font-semibold text-sm">
                            {selectedClass}-sinf dars jadvali yuklanmoqda...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    periods.map((p) => (
                      <tr key={p.num} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 text-center font-bold text-slate-400 bg-slate-50/60">
                          {p.num}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-600 text-xs whitespace-nowrap bg-slate-50/30">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {p.time}
                          </span>
                        </td>
                        {days.map((d) => {
                          const item = scheduleMatrix[`${d.key}_${p.num}`];
                          return (
                            <td key={d.key} className="py-3 px-3 align-top min-w-[150px]">
                              {item ? (
                                <div className="p-3 rounded-xl bg-blue-50/60 hover:bg-blue-50 border border-blue-100/80 transition-all hover:shadow-sm">
                                  <div className="font-bold text-slate-900 text-sm leading-tight">
                                    {item.subject}
                                  </div>
                                  {item.teacherName && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 truncate">
                                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="truncate">{item.teacherName.split(' ')[0]} {item.teacherName.split(' ')[1] || ''}</span>
                                    </div>
                                  )}
                                  {item.room && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold mt-1">
                                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                      <span>{item.room}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-3 rounded-xl bg-slate-50/40 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Responsive View (< 1024px) */}
          <div className="block lg:hidden space-y-4">
            {/* Day selector tabs */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 flex items-center justify-between gap-1 overflow-x-auto">
              {days.map((d) => {
                const isActive = selectedDayMobile === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSelectedDayMobile(d.key)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Lesson Cards */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {days.find((d) => d.key === selectedDayMobile)?.label} darslari
                </h4>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {selectedClass}-sinf
                </span>
              </div>

              {loadingWeekly ? (
                <div className="py-12 text-center text-slate-400">Yuklanmoqda...</div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {periods.map((p) => {
                    const item = scheduleMatrix[`${selectedDayMobile}_${p.num}`];
                    return (
                      <div
                        key={p.num}
                        className={`p-4 rounded-2xl border transition-all ${
                          item
                            ? 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                            : 'bg-slate-50/30 border-dashed border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {p.num}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 text-sm sm:text-base">
                                {item ? item.subject : 'Dars belgilanmagan'}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {p.time}
                              </div>
                            </div>
                          </div>

                          {item?.room && (
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100/80 text-blue-800 text-[11px] font-bold shrink-0">
                              {item.room}
                            </span>
                          )}
                        </div>

                        {item?.teacherName && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.teacherName}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TODAY'S LESSONS VIEW */
        <div className="space-y-6">
          {loadingToday ? (
            <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Bugungi darslar aniqlanmoqda...
            </div>
          ) : todayData ? (
            <div className="space-y-6">
              {/* Live Status Header */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Hozirgi vaqt: {todayData.currentTime}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black">
                      Bugun — {todayData.dayName}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      {selectedClass} sinfining bugungi darslari va holati
                    </p>
                  </div>

                  {/* Highlight current lesson or break card */}
                  {todayData.currentLesson ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 max-w-sm">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        Hozirgi dars jarayoni
                      </div>
                      <div className="text-lg font-black text-white mt-1">
                        {todayData.currentLesson.subject}
                      </div>
                      <div className="text-xs text-emerald-200 mt-0.5">
                        {todayData.currentLesson.startTime} – {todayData.currentLesson.endTime} | {todayData.currentLesson.room || 'Xona belgilanmagan'}
                      </div>
                    </div>
                  ) : todayData.isBreak ? (
                    <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-100 max-w-sm">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                        {todayData.breakLabel || 'Tanaffus'}
                      </div>
                      <div className="text-sm font-bold text-white mt-1">
                        {todayData.breakRemainingMinutes ? `Dars boshlanishiga taxminan ${todayData.breakRemainingMinutes} daqiqa qoldi` : 'Tanaffus vaqti'}
                      </div>
                      {todayData.nextLesson && (
                        <div className="text-xs text-amber-200 mt-1">
                          Keyingi: {todayData.nextLesson.period}-dars ({todayData.nextLesson.subject}, {todayData.nextLesson.startTime})
                        </div>
                      )}
                    </div>
                  ) : todayData.nextLesson ? (
                    <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-100 max-w-sm">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
                        <Clock className="w-3.5 h-3.5 text-blue-300" />
                        Keyingi dars
                      </div>
                      <div className="text-lg font-black text-white mt-1">
                        {todayData.nextLesson.subject}
                      </div>
                      <div className="text-xs text-blue-200 mt-0.5">
                        {todayData.nextLesson.startTime} – {todayData.nextLesson.endTime}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
                      Hozirda faol dars jarayoni yo'q
                    </div>
                  )}
                </div>

                {todayData.isWeekendNotice && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs">
                    {todayData.isWeekendNotice}
                  </div>
                )}
              </div>

              {/* Today's Lessons List with Badges */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
                <h4 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center justify-between">
                  <span>Darslar jadvali ({todayData.lessons.length} ta dars)</span>
                  <span className="text-xs text-slate-400 font-semibold">{todayData.dayName}</span>
                </h4>

                <div className="space-y-3">
                  {todayData.lessons.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      Bugungi kunda darslar belgilanmagan.
                    </div>
                  ) : (
                    todayData.lessons.map((item) => {
                      const isCurrent = item.status === 'current';
                      const isPast = item.status === 'past';
                      const isUpcoming = item.status === 'upcoming';

                      return (
                        <div
                          key={item.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isCurrent
                              ? 'bg-emerald-50/80 border-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                              : isPast
                              ? 'bg-slate-50/60 border-slate-200 opacity-60'
                              : 'bg-white border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                : isPast
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-blue-600 text-white shadow-sm'
                            }`}>
                              {item.period}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-base sm:text-lg text-slate-900">
                                  {item.subject}
                                </span>
                                {isCurrent && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm animate-pulse">
                                    Hozirgi dars
                                  </span>
                                )}
                                {isPast && (
                                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                    O'tgan
                                  </span>
                                )}
                                {isUpcoming && item === todayData.nextLesson && (
                                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                    Keyingi dars
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 font-semibold text-slate-600">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {item.startTime} – {item.endTime}
                                </span>
                                {item.teacherName && (
                                  <span className="flex items-center gap-1 text-slate-500">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    {item.teacherName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {item.room && (
                            <div className="sm:text-right shrink-0">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                {item.room}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
