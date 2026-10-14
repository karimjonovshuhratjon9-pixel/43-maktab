import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Search, User, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { SchoolClass } from '../../types/index.ts';

export const AdminStudents: React.FC = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    className: '8A',
    studentId: '',
    parentPhone: '',
    address: '',
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const [stdRes, clsRes] = await Promise.all([
        fetch('/api/admin/students', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/classes'),
      ]);

      if (stdRes.ok) {
        const stdData = await stdRes.json();
        setStudents(stdData);
      }
      if (clsRes.ok) {
        const clsData = await clsRes.json();
        setClasses(clsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'O\'quvchi qo\'shishda xatolik');

      setShowAddModal(false);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        className: '8A',
        studentId: '',
        parentPhone: '',
        address: '',
      });
      fetchStudents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.className?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-500" />
            O'quvchilar Hisoblari Boshqaruvi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Student loginlari, sinflar biriktirilishi va shaxsiy ma'lumotlar
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yangi o'quvchi qo'shish
        </button>
      </div>

      {/* Search box */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism, sinf yoki ID bo'yicha qidiruv..."
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">O'quvchi</th>
                <th className="py-3 px-4">Sinf</th>
                <th className="py-3 px-4">Login (Username)</th>
                <th className="py-3 px-4">ID raqami</th>
                <th className="py-3 px-4">Ota-ona telefoni</th>
                <th className="py-3 px-4">Manzil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    O'quvchilar topilmadi.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                        {s.fullName?.[0]}
                      </div>
                      <span>{s.fullName}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                        {s.className}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {s.user?.username || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{s.studentId}</td>
                    <td className="py-3 px-4 text-slate-300">{s.parentPhone || '—'}</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{s.address || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base">Yangi o'quvchi hisobini ochish</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">To'liq ism-familiyasi *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Masalan: Sardor Rustamov"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Login (Username) *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="student_8b"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Parol *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Kamida 6 belgi"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Sinf *</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">ID (Guvohnoma)</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="ST-8A-05"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Ota-ona telefoni</label>
                <input
                  type="text"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-white text-xs shadow-md transition-all"
                >
                  O'quvchi hisobini yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
