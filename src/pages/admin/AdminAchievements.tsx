import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Upload, 
  Image as ImageIcon,
  EyeOff,
  ArrowUpDown,
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Achievement } from '../../types/index.ts';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

export const AdminAchievements: React.FC = () => {
  const { token } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [viewingItem, setViewingItem] = useState<Achievement | null>(null);

  // File upload state
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
    studentName: '',
    className: '9A',
    contest: '',
    place: "1-o'rin (Oltin medal)",
    year: new Date().getFullYear(),
    imageUrl: '',
    description: '',
    isVisible: true,
    order: 1,
  });

  const fetchItems = () => {
    setLoading(true);
    fetch('/api/achievements?all=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAchievements(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      studentName: '',
      className: '9A',
      contest: '',
      place: "1-o'rin (Oltin medal)",
      year: new Date().getFullYear(),
      imageUrl: '',
      description: '',
      isVisible: true,
      order: achievements.length + 1,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (a: Achievement) => {
    setEditingItem(a);
    setFormData({
      studentName: a.studentName || a.fullName || '',
      className: a.className || '',
      contest: a.contest || a.title || '',
      place: a.place || "1-o'rin",
      year: a.year || new Date().getFullYear(),
      imageUrl: a.imageUrl || '',
      description: a.description || a.achievementDetails || '',
      isVisible: a.isVisible !== false,
      order: a.order ?? 1,
    });
    setShowModal(true);
  };

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg("Iltimos, faqat rasm faylini tanlang (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Rasm hajmi 10 MB dan oshmasligi kerak.");
      return;
    }

    setUploadingImage(true);
    setErrorMsg(null);

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Rasm yuklashda xatolik yuz berdi.");
      }

      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      setStatusMsg("Rasm muvaffaqiyatli serverga yuklandi.");
    } catch (err: any) {
      setErrorMsg(err.message || "Rasm yuklashda xatolik.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleVisibility = async (item: Achievement) => {
    try {
      const newVisible = !(item.isVisible !== false);
      const res = await fetch(`/api/achievements/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVisible: newVisible }),
      });
      if (!res.ok) throw new Error("Holatni o'zgartirishda xatolik.");
      setStatusMsg(`"${item.studentName}" holati ${newVisible ? "asosiy sahifada ko'rsatiladigan" : "yashirilgan"} qilib belgilandi.`);
      fetchItems();
    } catch (err: any) {
      setErrorMsg(err.message || "Xatolik yuz berdi.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    if (!formData.studentName.trim()) {
      setErrorMsg("Ism va familiya kiritilishi shart.");
      return;
    }
    if (!formData.contest.trim()) {
      setErrorMsg("Erishgan yutug'i yoki musobaqa nomi kiritilishi shart.");
      return;
    }

    const payload = {
      fullName: formData.studentName.trim(),
      studentName: formData.studentName.trim(),
      title: formData.contest.trim(),
      contest: formData.contest.trim(),
      className: formData.className.trim(),
      place: formData.place.trim(),
      year: Number(formData.year),
      imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      achievementDetails: formData.description.trim(),
      description: formData.description.trim(),
      isVisible: formData.isVisible,
      order: Number(formData.order) || 1,
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/achievements/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Ma'lumotni yangilashda xatolik yuz berdi");
        }
        setStatusMsg("Faxrli inson ma'lumoti muvaffaqiyatli tahrirlandi.");
      } else {
        const res = await fetch('/api/achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Yangi ma'lumot qo'shishda xatolik yuz berdi");
        }
        setStatusMsg("Yangi faxrli inson muvaffaqiyatli qo'shildi.");
      }

      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    }
  };

  const requestDelete = (item: Achievement) => {
    setDeleteId(item.id);
    setDeleteName(item.studentName || item.fullName || 'Faxrli inson');
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/achievements/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("O'chirishda xatolik yuz berdi");
      setStatusMsg(`${deleteName} ro'yxatdan o'chirildi.`);
      fetchItems();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const filteredItems = achievements.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (item.studentName || item.fullName || '').toLowerCase();
    const contest = (item.contest || item.title || '').toLowerCase();
    const cls = (item.className || '').toLowerCase();
    const place = (item.place || '').toLowerCase();
    const desc = (item.description || item.achievementDetails || '').toLowerCase();
    return name.includes(q) || contest.includes(q) || cls.includes(q) || place.includes(q) || desc.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Maktabimiz Faxrlari Boshqaruvi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Respublika, viloyat va xalqaro tanlovlar g'oliblari, namunali o'quvchilar va faxriy bitiruvchilar
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi faxrli inson qo'shish
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

      {/* Search Bar & Stats */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, sinf yoki yutuq bo'yicha qidiruv..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400 self-end sm:self-center font-medium">
          Jami: <strong className="text-white">{filteredItems.length}</strong> nafar
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Yuklanmoqda...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-800 space-y-3">
          <Trophy className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">
            {search ? "Qidiruv bo'yicha hech qanday ma'lumot topilmadi." : "Hozircha faxrli insonlar kiritilmagan."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
          >
            Birinchi faxrli insonni qo'shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isVisible = item.isVisible !== false;
            return (
              <div
                key={item.id}
                className={`bg-slate-900 rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                  isVisible ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/50 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.imageUrl}
                        alt={item.studentName}
                        onError={(e) => {
                          // Fallback placeholder
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                        }}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0 bg-slate-800"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-white">
                          {item.studentName || item.fullName}
                        </h4>
                        <div className="text-xs text-amber-400 font-bold mt-0.5">
                          {item.className ? `${item.className} sinf` : "Maktab faxri"}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                          {item.place}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      #{item.order ?? 1}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-medium mb-1">
                    🏆 {item.contest || item.title} ({item.year}-yil)
                  </div>
                  {(item.description || item.achievementDetails) && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description || item.achievementDetails}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleVisibility(item)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      isVisible 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    title={isVisible ? "Asosiy sahifada ko'rsatilmoqda" : "Asosiy sahifada yashirilgan"}
                  >
                    {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{isVisible ? "Ko'rsatilmoqda" : "Yashirilgan"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Ko'rish"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => requestDelete(item)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Detail Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setViewingItem(null)} />
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                Maktabimiz Faxri
              </span>
              <button onClick={() => setViewingItem(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={viewingItem.imageUrl}
                alt={viewingItem.studentName}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shrink-0 bg-slate-800"
              />
              <div>
                <h4 className="text-base font-black text-white">{viewingItem.studentName || viewingItem.fullName}</h4>
                <div className="text-xs font-bold text-blue-400 mt-0.5">
                  {viewingItem.className ? `${viewingItem.className} sinf` : ''} • {viewingItem.year}-yil
                </div>
                <div className="text-xs text-amber-400 font-bold mt-1">🏆 {viewingItem.place}</div>
              </div>
            </div>
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs text-slate-200 leading-relaxed space-y-2">
              <div className="font-bold text-white text-sm">{viewingItem.contest || viewingItem.title}</div>
              <p className="text-slate-300">
                {viewingItem.description || viewingItem.achievementDetails || "Batafsil ma'lumot kiritilmagan."}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Tartib raqami: #{viewingItem.order ?? 1}</span>
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
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
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                {editingItem ? "Ma'lumotni tahrirlash" : "Yangi faxrli inson qo'shish"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Ism va familiya *</label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Masalan: Azizbek Karimov"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Sinf yoki maqomi *</label>
                  <input
                    type="text"
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    placeholder="9A yoki Bitiruvchi"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Erishgan o'rni / Darajasi *</label>
                  <input
                    type="text"
                    required
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    placeholder="1-o'rin (Oltin medal)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">Musobaqa yoki olimpiada nomi *</label>
                  <input
                    type="text"
                    required
                    value={formData.contest}
                    onChange={(e) => setFormData({ ...formData, contest: e.target.value })}
                    placeholder="Respublika Fan Olimpiadasi (Matematika)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Yil *</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Real Image Upload Section */}
              <div className="space-y-2 p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
                <label className="block text-slate-300 font-bold">Rasm tanlash va yuklash</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {formData.imageUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-600 shrink-0">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center text-slate-500 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                      id="achievement-photo-upload"
                    />
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="achievement-photo-upload"
                        className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingImage ? "Yuklanmoqda..." : "Kompyuterdan rasm tanlash"}
                      </label>
                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="px-2 py-2 text-slate-400 hover:text-rose-400 text-xs"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="yoki rasm havolasini (URL) kiriting: https://..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Qanday yutuqqa erishgani haqida batafsil ma'lumot</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Qanday natija ko'rsatgani, yutuqning ahamiyati, murabbiyi yoki qo'shimcha faxriy ma'lumot..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Ko'rinish tartib raqami</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Asosiy sahifada ko'rsatish</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      formData.isVisible
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {formData.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{formData.isVisible ? "Ha, ko'rsatilsin" : "Yashirilsin"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-slate-950 text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {editingItem ? "O'zgarishlarni saqlash" : "Ro'yxatga qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="O'chirishni tasdiqlash"
        message={`Haqiqatan ham "${deleteName}" ma'lumotlarini ro'yxatdan o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
