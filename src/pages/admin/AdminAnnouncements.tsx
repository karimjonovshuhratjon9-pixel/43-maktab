import React, { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2, X, Pin, Search, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Announcement } from '../../types/index.ts';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

export const AdminAnnouncements: React.FC = () => {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [viewingItem, setViewingItem] = useState<Announcement | null>(null);

  // Deletion state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: "O'quv jarayoni",
    isPinned: false,
    targetAudience: 'all' as 'all' | 'students' | 'parents' | 'teachers',
    expiryDate: '',
  });

  const fetchItems = () => {
    setLoading(true);
    fetch('/api/announcements/admin', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data);
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
      title: '',
      content: '',
      category: "Rasmiy e'lon",
      isPinned: false,
      targetAudience: 'all',
      expiryDate: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingItem(a);
    setFormData({
      title: a.title,
      content: a.content,
      category: a.category || "Rasmiy e'lon",
      isPinned: !!a.isPinned,
      targetAudience: a.targetAudience || 'all',
      expiryDate: a.expiryDate || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      if (editingItem) {
        const res = await fetch(`/api/announcements/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("E'lonni yangilashda xatolik");
        setStatusMsg("E'lon muvaffaqiyatli tahrirlandi.");
      } else {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("E'lon yaratishda xatolik");
        setStatusMsg("Yangi e'lon muvaffaqiyatli joylashtirildi.");
      }

      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    }
  };

  const requestDelete = (item: Announcement) => {
    setDeleteId(item.id);
    setDeleteTitle(item.title);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/announcements/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("O'chirishda xatolik yuz berdi");
      setStatusMsg(`"${deleteTitle}" e'loni o'chirildi.`);
      fetchItems();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const filteredItems = announcements.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" />
            E'lonlar Boshqaruvi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Muhim e'lonlarni qo'shish, tahrirlash, qidirish, ko'rish va o'chirish
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi e'lon joylashtirish
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
            placeholder="E'lon sarlavhasi yoki matni bo'yicha..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-400 self-end sm:self-center font-medium">
          Jami: <strong className="text-white">{filteredItems.length}</strong> ta e'lon
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Yuklanmoqda...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-800 space-y-3">
          <Bell className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">
            {search ? "Qidiruv bo'yicha hech qanday e'lon topilmadi." : "Hozircha e'lonlar kiritilmagan."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
          >
            Birinchi e'lonni joylashtirish
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                item.isPinned
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {item.isPinned && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-current" />
                      Biriktirilgan
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300">
                    {item.category || "Rasmiy e'lon"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
                <h4 className="font-bold text-white text-base">{item.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{item.content}</p>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => setViewingItem(item)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Ko'rish"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Tahrirlash"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => requestDelete(item)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Item Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setViewingItem(null)} />
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {viewingItem.category || "Rasmiy e'lon"}
              </span>
              <button onClick={() => setViewingItem(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-xl font-black text-white">{viewingItem.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              {viewingItem.content}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
              <span>Sana: {new Date(viewingItem.createdAt).toLocaleDateString('uz-UZ')}</span>
              {viewingItem.isPinned && <span className="text-amber-400 font-bold">📌 Asosiy sahifaga biriktirilgan</span>}
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base">
                {editingItem ? "E'lonni tahrirlash" : "Yangi e'lon joylashtirish"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Sarlavha *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E'lon sarlavhasi..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Toifa</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Rasmiy e'lon">Rasmiy e'lon</option>
                    <option value="Dars jadvali">Dars jadvali</option>
                    <option value="Tadbirlar">Tadbirlar</option>
                    <option value="Dam olish kunlari">Dam olish kunlari</option>
                    <option value="Muhim">Muhim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Auditoriya</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">Barchaga</option>
                    <option value="students">O'quvchilarga</option>
                    <option value="parents">Ota-onalarga</option>
                    <option value="teachers">O'qituvchilarga</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">E'lon matni *</label>
                <textarea
                  rows={5}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="E'lon tafsilotlari..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isPinned" className="text-slate-300 font-bold cursor-pointer">
                  Bosh sahifaga biriktirish (Pin)
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-slate-950 text-xs shadow-md transition-all"
                >
                  {editingItem ? "O'zgarishlarni saqlash" : "E'lonni joylashtirish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="E'lonni o'chirish"
        message={`Haqiqatan ham "${deleteTitle}" e'lonini o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
