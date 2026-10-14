import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Send, CheckCircle2, AlertCircle, Building2, User, ExternalLink } from 'lucide-react';
import { TelegramIcon } from '../components/TelegramIcon.tsx';
import { formatTelegramUrl, formatTelegramHandle } from '../utils/telegram.ts';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    fetch('/api/school')
      .then((res) => res.json())
      .then((data) => {
        if (data.school) setSchool(data.school);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');

      setSuccess(data.message || 'Murojaatingiz muvaffaqiyatli qabul qilindi! Maktab ma\'muriyati tez orada ko‘rib chiqadi.');
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setError(err.message || 'Xabar yuborishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Rasmiy aloqa bo‘limi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Aloqa va Murojaat
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Maktabimiz ma'muriyatiga savol, taklif yoki murojaatlaringiz bo‘lsa, quyidagi shakl orqali to‘g‘ridan-to‘g‘ri xabar yuborishingiz mumkin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Verified Address & Leadership (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">Maktab ma'lumotlari</h3>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Maktab manzili:</div>
                  <div className="text-slate-600 mt-0.5 leading-relaxed font-medium">
                    88GG+522, Katput qishlog‘i, Farg‘ona viloyati, O‘zbekiston
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Maktab direktori:</div>
                  <div className="text-slate-700 mt-0.5 font-semibold">
                    Sheraliyev Axrorbek
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Direktor o‘rinbosari:</div>
                  <div className="text-slate-700 mt-0.5 font-semibold">
                    Boymatov To‘lqinjon
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Loyiha yaratuvchisi:</div>
                  <div className="text-amber-800 mt-0.5 font-bold">
                    Karimjonov Shuhratjon
                  </div>
                </div>
              </div>

              {/* Official Telegram Channel */}
              <div className="flex items-start gap-4 pt-2 border-t border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <TelegramIcon className="w-5 h-5 text-sky-500" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Rasmiy Telegram kanal:</div>
                  <div className="mt-1">
                    <a
                      href={formatTelegramUrl(school?.telegramChannel)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 hover:text-sky-700 font-bold text-xs border border-sky-500/20 transition-all"
                    >
                      <span>{formatTelegramHandle(school?.telegramChannel)}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
              * Maktab yangiliklari va tezkor xabarlarni kuzatish uchun rasmiy Telegram kanalimizga a'zo bo'ling. Shaxsiy murojaat va savollar uchun esa onlayn shakldan foydalaning.
            </div>
          </div>
        </div>

        {/* Right: Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Murojaat yuborish</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Barcha yuborilgan murojaatlar maktab ma'muriyati administrator paneliga to‘g‘ridan-to‘g‘ri yetib boradi.
            </p>
          </div>

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Ism va Familiyangiz *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ismingizni kiriting"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Telefon raqamingiz *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Elektron pochta (ixtiyoriy)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@misol.uz"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Mavzu
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Dars jadvali, taklif..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Murojaat matni *
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Savol yoki taklifingizni bayon eting..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Murojaatni yuborish</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
