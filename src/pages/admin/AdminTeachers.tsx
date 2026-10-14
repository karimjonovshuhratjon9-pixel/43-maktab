import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Edit2, Trash2, X, Search, CheckCircle2, AlertCircle, Eye, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Teacher } from '../../types/index.ts';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

export const DEFAULT_TEACHER_IMAGE = '/default-teacher.png';

export const AdminTeachers: React.FC = () => {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deletion state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    subject: '',
    roleTitle: '',
    experienceYears: 5,
    bio: '',
    imageUrl: '',
    phone: '',
    email: '',
    isFeatured: true,
  });

  const fetchTeachers = () => {
    setLoading(true);
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTeachers(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setFormData({
      fullName: '',
      subject: '',
      roleTitle: "O'qituvchi",
      experienceYears: 5,
      bio: '',
      imageUrl: '', // Foydalanuvchi yuklashi uchun bo'sh boshlanadi; agar yuklamasa DEFAULT_TEACHER_IMAGE qo'yiladi
      phone: '',
      email: '',
      isFeatured: false,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      fullName: t.fullName,
      subject: t.subject,
      roleTitle: t.roleTitle || "O'qituvchi",
      experienceYears: t.experienceYears || 1,
      bio: t.bio || '',
      imageUrl: t.imageUrl || '',
      phone: t.phone || '',
      email: t.email || '',
      isFeatured: !!t.isFeatured,
    });
    setShowModal(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg("Faqat rasm formatidagi fayllar qabul qilinadi (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("Rasm hajmi juda katta. Maksimal ruxsat etilgan hajm: 15 MB.");
      return;
    }

    setUploadingImage(true);
    setErrorMsg(null);

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const authToken = token || localStorage.getItem('school_token');
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Rasm yuklashda xatolik yuz berdi.");
      }

      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      setStatusMsg("Rasm qurilmadan muvaffaqiyatli yuklandi!");
    } catch (err: any) {
      setErrorMsg(err.message || "Rasm yuklashda xatolik yuz berdi.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    // Agar rasm yuklanmagan yoki kiritilmagan bo'lsa, standart rasmni avtomatik qo'yamiz
    const finalImageUrl = formData.imageUrl.trim() || DEFAULT_TEACHER_IMAGE;
    const payload = {
      ...formData,
      imageUrl: finalImageUrl,
    };

    try {
      const authToken = token || localStorage.getItem('school_token');
      if (editingTeacher) {
        const res = await fetch(`/api/teachers/${editingTeacher.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("O'qituvchini yangilashda xatolik");
        setStatusMsg("O'qituvchi ma'lumotlari muvaffaqiyatli yangilandi.");
      } else {
        const res = await fetch('/api/teachers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("O'qituvchi qo'shishda xatolik");
        setStatusMsg("Yangi o'qituvchi muvaffaqiyatli qo'shildi.");
      }

      setShowModal(false);
      fetchTeachers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    }
  };

  const requestDelete = (t: Teacher) => {
    setDeleteId(t.id);
    setDeleteName(t.fullName);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/teachers/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("O'chirishda xatolik yuz berdi");
      setStatusMsg(`${deleteName} ro'yxatdan o'chirildi.`);
      fetchTeachers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.fullName.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.bio && t.bio.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            O'qituvchilar Boshqaruvi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Maktab o'qituvchilari ma'lumotlarini qo'shish, tahrirlash, ko'rish va o'chirish
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi o'qituvchi qo'shish
        </button>
      </div>

      {/* Notifications */}
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
            placeholder="O'qituvchi yoki fan bo'yicha qidiruv..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-400 self-end sm:self-center font-medium">
          Jami: <strong className="text-white">{filteredTeachers.length}</strong> nafar
        </div>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">O'qituvchilar yuklanmoqda...</div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-800 space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">
            {search ? "Qidiruv bo'yicha hech qanday o'qituvchi topilmadi." : "Hozircha o'qituvchilar kiritilmagan."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
          >
            Birinchi o'qituvchini qo'shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 rounded-3xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={t.imageUrl || DEFAULT_TEACHER_IMAGE}
                    alt={t.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_TEACHER_IMAGE;
                    }}
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{t.fullName}</h4>
                    <div className="text-xs text-blue-400 font-bold mt-0.5">{t.subject}</div>
                    <div className="text-[11px] text-slate-400">{t.roleTitle || "O'qituvchi"}</div>
                  </div>
                </div>
                {t.bio && <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{t.bio}</p>}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Tajriba: {t.experienceYears || 1} yil</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewingTeacher(t)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Ko'rish"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => requestDelete(t)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Detail Modal */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setViewingTeacher(null)} />
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base">O'qituvchi ma'lumoti</h3>
              <button onClick={() => setViewingTeacher(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={viewingTeacher.imageUrl || DEFAULT_TEACHER_IMAGE}
                alt={viewingTeacher.fullName}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_TEACHER_IMAGE;
                }}
              />
              <div>
                <h4 className="text-base font-black text-white">{viewingTeacher.fullName}</h4>
                <div className="text-xs font-bold text-blue-400 mt-0.5">{viewingTeacher.subject}</div>
                <div className="text-xs text-slate-400 mt-0.5">{viewingTeacher.roleTitle}</div>
                <div className="text-xs text-slate-400 mt-1">Ish tajribasi: {viewingTeacher.experienceYears} yil</div>
              </div>
            </div>
            {viewingTeacher.bio && (
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs text-slate-300 leading-relaxed">
                {viewingTeacher.bio}
              </div>
            )}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingTeacher(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base">
                {editingTeacher ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi kiritish"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">To'liq ism-familiya *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Masalan: Tursunov Alisher B."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Fan *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Matematika"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Lavozim / Toifa</label>
                  <input
                    type="text"
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    placeholder="Oliy toifali o'qituvchi"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Ish tajribasi (yil)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* O'qituvchi rasmi: Qurilmadan yuklash & Standart rasm */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    O'qituvchi rasmi (qurilmadan yuklash)
                  </label>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="text-[11px] text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer"
                    >
                      Rasmni tozalash (Standart rasmga qaytarish)
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Preview */}
                  <div className="relative shrink-0">
                    <img
                      src={formData.imageUrl || DEFAULT_TEACHER_IMAGE}
                      alt="Preview"
                      className={`w-20 h-20 rounded-2xl object-cover border-2 shadow-md ${
                        formData.imageUrl ? 'border-emerald-500/80' : 'border-slate-600 border-dashed'
                      }`}
                    />
                    <div
                      className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow ${
                        formData.imageUrl ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {formData.imageUrl ? 'Yuklangan' : 'Standart'}
                    </div>
                  </div>

                  {/* Upload button & info */}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                      id="teacher-device-photo-upload"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="teacher-device-photo-upload"
                        className={`px-3.5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm ${
                          uploadingImage
                            ? 'bg-slate-700 cursor-not-allowed opacity-75'
                            : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Qurilmadan yuklanmoqda...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Qurilmadan rasm tanlash</span>
                          </>
                        )}
                      </label>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-tight">
                      {formData.imageUrl ? (
                        <span className="text-emerald-400 font-medium">✓ Rasm muvaffaqiyatli tanlandi.</span>
                      ) : (
                        <span>
                          💡 <strong>Eslatma:</strong> Agar qurilmadan rasm yuklamasangiz, avtomatik standart rasm qo'yiladi.
                        </span>
                      )}
                    </p>

                    {/* Optional URL input for maximum flexibility */}
                    <div className="pt-1">
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="yoki rasm havolasi (URL): https://..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Biografiya va qisqa ma'lumot</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Ustozning erishgan yutuqlari va pedagogik uslubi..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Telefon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998 90..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ustoz@maktab43.uz"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-extrabold text-white text-xs shadow-md transition-all"
                >
                  {editingTeacher ? "O'zgarishlarni saqlash" : "O'qituvchini qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="O'qituvchini o'chirish"
        message={`Haqiqatan ham "${deleteName}" o'qituvchisini ro'yxatdan o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
