import React, { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2, X, Eye, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { NewsArticle } from '../../types/index.ts';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

export const AdminNews: React.FC = () => {
  const { token, user } = useAuth();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [viewingArticle, setViewingArticle] = useState<NewsArticle | null>(null);

  // Deletion state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    category: "O'quv jarayoni",
    author: '',
  });

  const fetchNews = () => {
    setLoading(true);
    fetch('/api/news/admin', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNews(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
      category: "O'quv jarayoni",
      author: user?.fullName || "Maktab Ma'muriyati",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (n: NewsArticle) => {
    setEditingArticle(n);
    setFormData({
      title: n.title,
      summary: n.summary || '',
      content: n.content,
      coverImage: n.coverImage || '',
      category: n.category || "O'quv jarayoni",
      author: n.author || user?.fullName || "Maktab Ma'muriyati",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      if (editingArticle) {
        const res = await fetch(`/api/news/${editingArticle.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Yangilikni yangilashda xatolik yuz berdi');
        setStatusMsg("Yangilik muvaffaqiyatli tahrirlandi.");
      } else {
        const res = await fetch('/api/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Yangilik yaratishda xatolik yuz berdi');
        setStatusMsg("Yangi maqola muvaffaqiyatli joylashtirildi.");
      }

      setShowModal(false);
      fetchNews();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    }
  };

  const requestDelete = (item: NewsArticle) => {
    setDeleteId(item.id);
    setDeleteTitle(item.title);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/news/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("O'chirishda xatolik yuz berdi");
      setStatusMsg(`"${deleteTitle}" yangiligi o'chirildi.`);
      fetchNews();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const filteredNews = news.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.summary && item.summary.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-500" />
            Maktab Yangiliklari Boshqaruvi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sayt yangiliklari bo'limidagi maqolalarni qo'shish, tahrirlash, ko'rish va o'chirish
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi maqola yaratish
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
            placeholder="Yangilik sarlavhasi yoki toifasi bo'yicha..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-400 self-end sm:self-center font-medium">
          Jami: <strong className="text-white">{filteredNews.length}</strong> ta maqola
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Yuklanmoqda...</div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-800 space-y-3">
          <Bell className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">
            {search ? "Qidiruv bo'yicha hech qanday yangilik topilmadi." : "Hozircha yangiliklar kiritilmagan."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
          >
            Birinchi yangilikni yozish
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 rounded-3xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.coverImage || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80'}
                  alt={item.title}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-800"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300">
                      {item.category || "Umumiy"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.summary}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => setViewingArticle(item)}
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

      {/* View Article Modal */}
      {viewingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setViewingArticle(null)} />
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {viewingArticle.category}
              </span>
              <button onClick={() => setViewingArticle(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-xl font-black text-white">{viewingArticle.title}</h3>
            {viewingArticle.coverImage && (
              <img
                src={viewingArticle.coverImage}
                alt={viewingArticle.title}
                className="w-full h-56 object-cover rounded-2xl border border-slate-800"
              />
            )}
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{viewingArticle.content}</p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingArticle(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base">
                {editingArticle ? "Yangilikni tahrirlash" : "Yangi maqola e'lon qilish"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Sarlavha *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Maqola sarlavhasi..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Toifa</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="O'quv jarayoni">O'quv jarayoni</option>
                    <option value="Tadbirlar">Tadbirlar</option>
                    <option value="Olimpiada">Olimpiada</option>
                    <option value="Sport">Sport</option>
                    <option value="E'lon">E'lon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Muallif</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Qisqa tavsif</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Bir-ikki jumladan iborat qisqa xulosa..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Asosiy matn (Kontent) *</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Maqolaning to'liq matni..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Muqova rasmi (URL)</label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-extrabold text-white text-xs shadow-md transition-all"
                >
                  {editingArticle ? "O'zgarishlarni saqlash" : "Yangilikni chop etish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Yangilikni o'chirish"
        message={`Haqiqatan ham "${deleteTitle}" maqolasini butunlay o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
