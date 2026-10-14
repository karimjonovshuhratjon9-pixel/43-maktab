import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  ArrowRight,
  RefreshCw,
  Eye,
  Layers,
  History,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ScheduleItem, ScheduleVersion, ExcelPreview, WeekDay, SchoolClass } from '../../types/index.ts';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

export const AdminSchedule: React.FC = () => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('8A');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Excel Upload & Preview States
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<{ fileName: string; preview: ExcelPreview } | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual Lesson CRUD Modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ScheduleItem | null>(null);
  const [lessonFormData, setLessonFormData] = useState({
    className: '8A',
    day: 'Du' as WeekDay,
    period: 1,
    subject: '',
    teacherName: '',
    room: '',
  });

  // Delete lesson state
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);
  const [deleteLessonLoading, setDeleteLessonLoading] = useState(false);

  // Versions history
  const [versions, setVersions] = useState<ScheduleVersion[]>([]);

  // Fetch classes & schedule on load
  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClasses(data);
          if (data.length > 0 && !selectedClass) setSelectedClass(data[0].name);
        }
      });

    fetchVersions();
  }, []);

  const fetchVersions = () => {
    fetch('/api/schedule/versions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVersions(data);
      })
      .catch((err) => console.error(err));
  };

  const loadScheduleForClass = (clsName: string) => {
    setSelectedClass(clsName);
    setLoadingSchedule(true);
    fetch(`/api/schedule?class=${encodeURIComponent(clsName)}`)
      .then((res) => res.json())
      .then((data) => {
        setSchedules(data.schedule || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingSchedule(false));
  };

  useEffect(() => {
    if (selectedClass) {
      loadScheduleForClass(selectedClass);
    }
  }, [selectedClass]);

  // Handle Excel File Selected -> Request Preview from backend
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage(null);
    setImportSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/schedule/parse-excel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Excel faylni tahlil qilishda xatolik');

      setPreviewData({
        fileName: data.fileName,
        preview: data.preview,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Excel faylini o\'qishda xatolik.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Open replace question modal
  const handleProceedToImport = () => {
    setShowReplaceModal(true);
  };

  // Commit Import with chosen Replace Mode
  const handleConfirmImport = async (replaceMode: 'replace' | 'archive') => {
    if (!previewData) return;

    setImporting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/schedule/confirm-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: previewData.preview.parsedItems,
          replaceMode,
          fileName: previewData.fileName,
          title: `2026-2027 o'quv yili (${previewData.fileName})`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Importni saqlashda xatolik');

      setImportSuccess(data.message || 'Dars jadvali muvaffaqiyatli saqlandi!');
      setPreviewData(null);
      setShowReplaceModal(false);
      fetchVersions();
      loadScheduleForClass(selectedClass);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setImporting(false);
    }
  };

  // Activate specific version
  const handleActivateVersion = async (versionId: string) => {
    try {
      const res = await fetch(`/api/schedule/versions/${versionId}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchVersions();
        loadScheduleForClass(selectedClass);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manual Lesson CRUD Submit
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        // PUT update
        const res = await fetch(`/api/schedule/lesson/${editingLesson.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(lessonFormData),
        });
        if (!res.ok) throw new Error('Darsni yangilashda xatolik');
      } else {
        // POST create
        const res = await fetch('/api/schedule/lesson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(lessonFormData),
        });
        if (!res.ok) throw new Error('Darsni qo\'shishda xatolik');
      }

      setShowLessonModal(false);
      setEditingLesson(null);
      loadScheduleForClass(selectedClass);
    } catch (err: any) {
      setErrorMessage(err.message || 'Xatolik yuz berdi');
    }
  };

  // Delete Lesson Request
  const handleDeleteLesson = (lessonId: string) => {
    setDeleteLessonId(lessonId);
  };

  const handleConfirmDeleteLesson = async () => {
    if (!deleteLessonId) return;
    setDeleteLessonLoading(true);
    try {
      const res = await fetch(`/api/schedule/lesson/${deleteLessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadScheduleForClass(selectedClass);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLessonLoading(false);
      setDeleteLessonId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Dars Jadvali Boshqaruvi
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Excel fayldan to'liq jadvalni import qiling yoki qo'lda tahrirlang
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/schedule/template"
            download
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Namunaviy Excel faylni yuklab olish
          </a>

          <button
            onClick={() => {
              setEditingLesson(null);
              setLessonFormData({
                className: selectedClass,
                day: 'Du',
                period: 1,
                subject: '',
                teacherName: '',
                room: '',
              });
              setShowLessonModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yangi dars qo'shish
          </button>
        </div>
      </div>

      {/* Notifications */}
      {importSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{importSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: EXCEL IMPORT UPLOAD ZONE */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-dashed border-slate-700 hover:border-blue-500/70 transition-all text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/20">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white">
              Excel dars jadvalini yuklash
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              <code>dars jadval.xlsx</code> formatidagi faylni yuklang. Tizim sinf ustunlari, kunlar, dars raqami va fanlarni avtomatik aniqlaydi.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 mx-auto disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Fayl tahlil qilinmoqda...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Excel faylni tanlash (.xlsx)</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            Faqat .xlsx va .xls formatlari qo'llab-quvvatlanadi. Maksimal hajm: 15MB.
          </div>
        </div>
      </div>

      {/* SECTION 2: IMPORT PREVIEW MODAL / DRAWER */}
      {previewData && (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-blue-500/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 mb-2">
                <Eye className="w-3.5 h-3.5" />
                Importdan oldingi tekshiruv (Preview)
              </div>
              <h3 className="text-xl font-black text-white">
                Fayl aniqlandi: {previewData.fileName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleProceedToImport}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Import qilishga o'tish
              </button>
            </div>
          </div>

          {/* Detected Summary Badges as requested in brief */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Qatorlar</div>
              <div className="text-xl font-black text-white mt-0.5">
                {previewData.preview.totalRows} rows detected
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Sinflar</div>
              <div className="text-xl font-black text-blue-400 mt-0.5">
                {previewData.preview.detectedClasses.length} classes detected
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Hafta kunlari</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                {previewData.preview.detectedDays.length} days detected
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Dars soatlari</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {previewData.preview.detectedPeriods.length} lesson periods
              </div>
            </div>
          </div>

          {/* Detected classes list */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Aniqlangan sinf ustunlari ({previewData.preview.detectedClasses.length} ta):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {previewData.preview.detectedClasses.map((cls) => (
                <span
                  key={cls}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>

          {/* Sample items table preview */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Darslar namunasi (Dastlabki 10 ta yozuv):
            </span>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Sinf</th>
                    <th className="py-2.5 px-3">Kun</th>
                    <th className="py-2.5 px-3">Dars №</th>
                    <th className="py-2.5 px-3">Vaqt</th>
                    <th className="py-2.5 px-3">Fan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {previewData.preview.sampleItems.map((s, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-bold text-white">{s.className}</td>
                      <td className="py-2 px-3">{s.day}</td>
                      <td className="py-2 px-3">{s.period}</td>
                      <td className="py-2 px-3">{s.time}</td>
                      <td className="py-2 px-3 font-semibold text-blue-300">{s.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: REPLACE / ARCHIVE DIALOG (Requirement #12) */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowReplaceModal(false)}
          />
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black leading-snug">
                  Yangi jadvalni mavjud jadval o‘rniga qo‘ymoqchimisiz?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mavjud jadvalni to'liq yangisiga almashtirish yoki eski jadvalni arxiv sifatida saqlab yangisini faollashtirishni tanlang.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option 1: Eski jadvalni almashtirish */}
              <button
                type="button"
                disabled={importing}
                onClick={() => handleConfirmImport('replace')}
                className="w-full text-left p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-extrabold text-sm text-rose-300 group-hover:text-rose-200">
                    Eski jadvalni to'liq almashtirish
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Mavjud barcha darslar o'chirilib, faqat yangi Excel jadvali joylanadi.
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Eski jadvalni saqlash (arxivlash) */}
              <button
                type="button"
                disabled={importing}
                onClick={() => handleConfirmImport('archive')}
                className="w-full text-left p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-extrabold text-sm text-blue-300 group-hover:text-blue-200">
                    Eski jadvalni saqlash (Arxivga o'tkazish)
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Oldingi jadval arxivda saqlanadi, yangi yuklangan jadval esa faol jadval bo'ladi.
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 3: Bekor qilish */}
              <button
                type="button"
                disabled={importing}
                onClick={() => setShowReplaceModal(false)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all text-center"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: MANUAL SCHEDULE EDITOR (CRUD) */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-400" />
              Qo'lda tahrirlash (Sinflar kesimida)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ixtiyoriy sinfni tanlang va darslarni tahrirlang yoki o'chiring
            </p>
          </div>

          {/* Class selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-xl scrollbar-thin">
            {classes.map((cls) => (
              <button
                key={cls.name}
                type="button"
                onClick={() => setSelectedClass(cls.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  selectedClass === cls.name
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Table for Selected Class */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-3">Kun</th>
                <th className="py-3 px-3">Dars №</th>
                <th className="py-3 px-3">Vaqt</th>
                <th className="py-3 px-3">Fan nomi</th>
                <th className="py-3 px-3">O'qituvchi</th>
                <th className="py-3 px-3">Xona</th>
                <th className="py-3 px-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
              {loadingSchedule ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Bu sinf uchun darslar kiritilmagan.
                  </td>
                </tr>
              ) : (
                schedules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-blue-300">{item.day}</td>
                    <td className="py-3 px-3 font-bold text-white">{item.period}</td>
                    <td className="py-3 px-3 text-slate-400">{item.startTime}–{item.endTime}</td>
                    <td className="py-3 px-3 font-bold text-white text-sm">{item.subject}</td>
                    <td className="py-3 px-3 text-slate-300">{item.teacherName || '—'}</td>
                    <td className="py-3 px-3 text-slate-300">{item.room || '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLesson(item);
                            setLessonFormData({
                              className: item.className,
                              day: item.day,
                              period: item.period,
                              subject: item.subject,
                              teacherName: item.teacherName || '',
                              room: item.room || '',
                            });
                            setShowLessonModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(item.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5: SCHEDULE VERSIONS & HISTORY */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          Jadval Versiyalari Tarixi
        </h3>

        <div className="divide-y divide-slate-800">
          {versions.map((v) => (
            <div key={v.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{v.title}</span>
                  {v.isActive ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Faol versiya
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400">
                      Arxiv
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Yuklangan sana: {new Date(v.createdAt).toLocaleString('uz-UZ')} {v.uploadedBy ? `| ${v.uploadedBy}` : ''}
                </div>
              </div>

              {!v.isActive && (
                <button
                  type="button"
                  onClick={() => handleActivateVersion(v.id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-all"
                >
                  Faollashtirish
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LESSON MODAL (CREATE / EDIT) */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowLessonModal(false)}
          />
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base">
                {editingLesson ? 'Darsni tahrirlash' : 'Yangi dars qo\'shish'}
              </h3>
              <button
                onClick={() => setShowLessonModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Sinf</label>
                <select
                  value={lessonFormData.className}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, className: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {classes.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kun</label>
                  <select
                    value={lessonFormData.day}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, day: e.target.value as WeekDay })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Du">Dushanba (Du)</option>
                    <option value="Se">Seshanba (Se)</option>
                    <option value="Ch">Chorshanba (Ch)</option>
                    <option value="Pa">Payshanba (Pa)</option>
                    <option value="Ju">Juma (Ju)</option>
                    <option value="Sh">Shanba (Sh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Dars raqami (1-6)</label>
                  <select
                    value={lessonFormData.period}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, period: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={1}>1-dars (08:00–08:45)</option>
                    <option value={2}>2-dars (08:50–09:35)</option>
                    <option value={3}>3-dars (09:40–10:25)</option>
                    <option value={4}>4-dars (10:35–11:20)</option>
                    <option value={5}>5-dars (11:25–12:10)</option>
                    <option value={6}>6-dars (12:15–13:00)</option>
                    <option value={7}>7-dars (13:05–13:50)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Fan nomi *</label>
                <input
                  type="text"
                  required
                  value={lessonFormData.subject}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, subject: e.target.value })}
                  placeholder="Masalan: Matematika"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">O'qituvchi</label>
                  <input
                    type="text"
                    value={lessonFormData.teacherName}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, teacherName: e.target.value })}
                    placeholder="Masalan: Rahmonova D."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Xona</label>
                  <input
                    type="text"
                    value={lessonFormData.room}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, room: e.target.value })}
                    placeholder="Masalan: 34-xona"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-extrabold text-white text-xs shadow-md transition-all"
                >
                  {editingLesson ? 'Saqlash' : 'Darsni qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Lesson Modal */}
      <ConfirmModal
        isOpen={!!deleteLessonId}
        title="Darsni o'chirish"
        message="Haqiqatan ham ushbu dars soatini jadvaldan o'chirmoqchimisiz?"
        confirmLabel="Darsni o'chirish"
        onConfirm={handleConfirmDeleteLesson}
        onCancel={() => setDeleteLessonId(null)}
        loading={deleteLessonLoading}
      />
    </div>
  );
};
