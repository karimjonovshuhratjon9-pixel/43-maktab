import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, X, CheckCircle2, AlertCircle, Edit2, Search, Calendar } from 'lucide-react';
import { SchoolClass } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

export const AdminClasses: React.FC = () => {
  const { token } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('8');
  const [classShift, setClassShift] = useState('1');
  const [classRoom, setClassRoom] = useState('');
  const [classTeacher, setClassTeacher] = useState('');

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchClasses = () => {
    setLoading(true);
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClasses(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenCreate = () => {
    setEditingClass(null);
    setClassName('');
    setClassGrade('8');
    setClassShift('1');
    setClassRoom('');
    setClassTeacher('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setClassGrade(String(cls.grade));
    setClassShift(String(cls.shift || 1));
    setClassRoom(cls.room || '');
    setClassTeacher(cls.classTeacher || '');
    setIsModalOpen(true);
  };

  const handleSubmitClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      if (editingClass) {
        // Edit class
        const res = await fetch(`/api/classes/${editingClass.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: className.trim().toUpperCase(),
            grade: Number(classGrade),
            shift: Number(classShift),
            room: classRoom,
            classTeacher: classTeacher,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sinfni yangilashda xatolik yuz berdi.");
        setStatusMsg(`${className} sinfi ma'lumotlari muvaffaqiyatli yangilandi.`);
      } else {
        // Create class
        const res = await fetch('/api/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: className.trim().toUpperCase(),
            grade: Number(classGrade),
            shift: Number(classShift),
            room: classRoom,
            classTeacher: classTeacher,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sinf qo'shishda xatolik yuz berdi.");
        setStatusMsg(`Yangi sinf (${className}) muvaffaqiyatli qo‘shildi.`);
      }

      setIsModalOpen(false);
      fetchClasses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi.');
    }
  };

  const requestDeleteClass = (cls: SchoolClass) => {
    setDeleteId(cls.id);
    setDeleteName(cls.name);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/classes/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Sinfni o‘chirishda xatolik yuz berdi.");
      setStatusMsg(`${deleteName} sinfi muvaffaqiyatli o‘chirildi.`);
      fetchClasses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi.');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      cls.name.toLowerCase().includes(q) ||
      (cls.classTeacher && cls.classTeacher.toLowerCase().includes(q)) ||
      (cls.room && cls.room.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Maktab Sinflari Boshqaruvi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Jami {classes.length} ta faol sinf (1A – 11A). Sinflarni qo'shish, tahrirlash va o'chirish.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi sinf qo‘shish
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sinf nomi yoki rahbar ismi bo'yicha..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-400 self-end sm:self-center font-medium">
          Topildi: <strong className="text-white">{filteredClasses.length}</strong> ta sinf
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Sinflar yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-black text-lg flex items-center justify-center">
                    {cls.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Sinfni tahrirlash"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => requestDeleteClass(cls)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Sinfni o‘chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-slate-400">
                    Sinf rahbari: <strong className="text-white block">{cls.classTeacher || 'Belgilanmagan'}</strong>
                  </div>
                  <div className="text-slate-400">
                    Xona: <strong className="text-blue-300">{cls.room || '—'}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{cls.grade}-bosqich ({cls.shift || 1}-smena)</span>
                <span className="font-bold text-blue-400">Faol sinf</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">
                {editingClass ? `${editingClass.name} Sinfini Tahrirlash` : 'Yangi Sinf Qo‘shish'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClass} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Sinf nomi (Masalan: 8A, 9B, 11A) *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="8A"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 uppercase font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Bosqich (Sinf) *</label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((g) => (
                      <option key={g} value={g}>
                        {g}-sinf
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Smena *</label>
                  <select
                    value={classShift}
                    onChange={(e) => setClassShift(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1-smena (Ertalab)</option>
                    <option value="2">2-smena (Tushdan keyin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Sinf xonasi raqami</label>
                <input
                  type="text"
                  value={classRoom}
                  onChange={(e) => setClassRoom(e.target.value)}
                  placeholder="204-xona"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Sinf rahbari (F.I.Sh.)</label>
                <input
                  type="text"
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                  placeholder="Ism-familiya"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
                >
                  {editingClass ? "Saqlash" : "Qo‘shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Sinfni o'chirish"
        message={`Haqiqatan ham "${deleteName}" sinfini va unga tegishli barcha dars jadvallarini o'chirmoqchimisiz?`}
        confirmLabel="Sinfni o'chirish"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
