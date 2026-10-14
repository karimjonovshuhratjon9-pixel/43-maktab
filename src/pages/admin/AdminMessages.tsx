import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Mail, Phone, Check, Clock, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ContactMessage } from '../../types/index.ts';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

export const AdminMessages: React.FC = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Deletion state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSender, setDeleteSender] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMessages = () => {
    setLoading(true);
    fetch('/api/messages/messages', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch(`/api/messages/messages/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isRead: !currentRead }),
      });
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const requestDelete = (m: ContactMessage) => {
    setDeleteId(m.id);
    setDeleteSender(m.fullName);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/messages/messages/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("O'chirishda xatolik yuz berdi");
      setStatusMsg(`${deleteSender} tomonidan yuborilgan murojaat o'chirildi.`);
      fetchMessages();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (m.phone && m.phone.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      m.message.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-500" />
            Kelib Tushgan Murojaatlar
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sayt aloqa bo'limi orqali yuborilgan fuqarolar va ota-onalar murojaatlari
          </p>
        </div>
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
            placeholder="Ism, telefon yoki mavzu bo'yicha..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="text-xs text-slate-400 self-end sm:self-center font-medium">
          Jami: <strong className="text-white">{filteredMessages.length}</strong> ta murojaat
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Yuklanmoqda...</div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-16 text-center text-slate-500 border border-slate-800">
          {search ? "Qidiruv bo'yicha murojaat topilmadi." : "Hozirda yangi murojaatlar yo'q."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((m) => (
            <div
              key={m.id}
              className={`p-6 rounded-3xl border transition-all ${
                !m.isRead
                  ? 'bg-purple-950/20 border-purple-500/40 shadow-lg'
                  : 'bg-slate-900 border-slate-800 opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base">{m.fullName}</span>
                  {!m.isRead && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white">
                      Yangi
                    </span>
                  )}
                  {m.subject && <span className="text-xs font-bold text-slate-400">| {m.subject}</span>}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(m.createdAt).toLocaleString('uz-UZ')}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 text-xs text-slate-200 leading-relaxed mb-4 whitespace-pre-line">
                {m.message}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex flex-wrap items-center gap-4">
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="flex items-center gap-1 text-blue-400 hover:underline">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{m.phone}</span>
                    </a>
                  )}
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1 text-slate-300 hover:underline">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{m.email}</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(m.id, m.isRead)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{m.isRead ? "O'qilmagan qilish" : "O'qildi deb belgilash"}</span>
                  </button>
                  <button
                    onClick={() => requestDelete(m)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Murojaatni o'chirish"
        message={`Haqiqatan ham "${deleteSender}" tomonidan yuborilgan ushbu murojaatni o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
