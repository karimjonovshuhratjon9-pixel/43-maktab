import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, X, Search, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { GalleryItem } from '../../types/index.ts';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

export const AdminGallery: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<GalleryItem | null>(null);

  // Deletion state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Maktab' as GalleryItem['category'],
    imageUrl: '',
    description: '',
  });

  const fetchItems = () => {
    setLoading(true);
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Rasm qo'shishda xatolik yuz berdi");

      setShowModal(false);
      setStatusMsg("Yangi rasm galereyaga muvaffaqiyatli qo'shildi.");
      setFormData({
        title: '',
        category: 'Maktab',
        imageUrl: '',
        description: '',
      });
      fetchItems();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    }
  };

  const requestDelete = (item: GalleryItem) => {
    setDeleteId(item.id);
    setDeleteTitle(item.title);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/gallery/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("O'chirishda xatolik yuz berdi");
      setStatusMsg(`"${deleteTitle}" rasmi galereyadan o'chirildi.`);
      fetchItems();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-500" />
            Galereya Boshqaruvi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Maktab fotogalereyasiga rasmlar joylash, qidirish, ko'rish va o'chirish
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi rasm yuklash
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
            placeholder="Rasm nomi yoki toifasi bo'yicha..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-400 self-end sm:self-center font-medium">
          Jami: <strong className="text-white">{filteredItems.length}</strong> ta rasm
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Yuklanmoqda...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-800 space-y-3">
          <ImageIcon className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">
            {search ? "Qidiruv bo'yicha hech qanday rasm topilmadi." : "Hozircha fotogalereyaga rasmlar kiritilmagan."}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
          >
            Birinchi rasmni yuklash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-800 group">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setViewingItem(item)}
                    className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white shadow-md"
                    title="Kattalashtirib ko'rish"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => requestDelete(item)}
                    className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-md"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-white">
                  {item.category || "Maktab"}
                </span>
              </div>
              <div className="p-3.5 text-xs">
                <h4 className="font-bold text-white truncate">{item.title}</h4>
                {item.description && (
                  <p className="text-slate-400 truncate mt-0.5">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setViewingItem(null)} />
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {viewingItem.category || "Maktab"}
              </span>
              <button onClick={() => setViewingItem(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={viewingItem.imageUrl}
              alt={viewingItem.title}
              className="w-full max-h-96 object-contain rounded-2xl bg-black/40"
            />
            <div>
              <h3 className="text-lg font-black text-white">{viewingItem.title}</h3>
              {viewingItem.description && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{viewingItem.description}</p>
              )}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base">Galereyaga rasm qo'shish</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Rasm sarlavhasi *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Maktab binosi, 1-qo'ng'iroq..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Rasm havolasi (URL) *</label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Toifa</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Maktab">Maktab binosi</option>
                  <option value="Tadbirlar">Tadbirlar</option>
                  <option value="Sport">Sport</option>
                  <option value="Dars jarayoni">Dars jarayoni</option>
                  <option value="Yutuqlar">Yutuqlar</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Tavsif (ixtiyoriy)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rasm haqida qisqacha ma'lumot..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-xs shadow-md transition-all"
                >
                  Rasmni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Rasmni o'chirish"
        message={`Haqiqatan ham "${deleteTitle}" rasmini galereyadan o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
