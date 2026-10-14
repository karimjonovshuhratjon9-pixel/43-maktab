import React, { useState, useEffect } from 'react';
import { Search, Filter, Phone, Mail, Award, Users, BookOpen } from 'lucide-react';
import { Teacher } from '../types/index.ts';

const DEFAULT_TEACHER_IMAGE = '/default-teacher.png';

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Hammasi');
  const [loading, setLoading] = useState(true);

  const subjectsList = [
    'Hammasi',
    'Matematika',
    'Fizika',
    'Ona tili',
    'Ingliz tili',
    'Biologiya',
    'Kimyo',
    'Tarix',
    'Jismoniy tarbiya',
    'Informatika'
  ];

  useEffect(() => {
    setLoading(true);
    let url = '/api/teachers';
    const params = new URLSearchParams();
    if (search.trim()) params.append('query', search.trim());
    if (selectedSubject !== 'Hammasi') params.append('subject', selectedSubject);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTeachers(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, selectedSubject]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Users className="w-3.5 h-3.5" />
            <span>Pedagogik Kengash</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Maktab O'qituvchilari
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            43-maktabning oliy toifali, boy amaliy tajribaga ega va fidoyi ustozlari bilan tanishing.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O'qituvchi ismi yoki fan bo'yicha qidiruv..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold self-end md:self-center">
            Topildi: <span className="text-blue-600 font-bold">{teachers.length} nafar</span> o'qituvchi
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {subjectsList.map((sub) => {
            const isSelected = selectedSubject === sub;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          O'qituvchilar yuklanmoqda...
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-slate-200">
          Qidiruv bo'yicha hech qanday o'qituvchi topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={teacher.imageUrl || DEFAULT_TEACHER_IMAGE}
                    alt={teacher.fullName}
                    className="w-20 h-20 rounded-2xl object-cover shadow-sm shrink-0 bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_TEACHER_IMAGE;
                    }}
                    loading="lazy"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                      {teacher.fullName}
                    </h4>
                    <div className="text-xs font-bold text-blue-600 mt-0.5">
                      {teacher.subject}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {teacher.roleTitle}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                  {teacher.bio}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between font-semibold">
                  <span>Ish staji:</span>
                  <span className="text-slate-800 font-bold">{teacher.experienceYears} yil</span>
                </div>

                {teacher.phone && (
                  <div className="flex items-center gap-2 text-slate-600 pt-1">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                {teacher.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>{teacher.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
