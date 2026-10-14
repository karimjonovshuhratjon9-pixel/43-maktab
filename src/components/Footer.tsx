import React from 'react';
import { GraduationCap, MapPin, User, ShieldCheck, ExternalLink } from 'lucide-react';
import { TelegramIcon } from './TelegramIcon.tsx';
import { formatTelegramUrl, formatTelegramHandle } from '../utils/telegram.ts';

interface FooterProps {
  navigate: (route: string) => void;
  telegramChannel?: string;
}

export const Footer: React.FC<FooterProps> = ({ navigate, telegramChannel }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: About School */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">43-MAKTAB</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Farg‘ona viloyati 43-umumiy o‘rta ta’lim maktabining rasmiy elektron axborot platformasi.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                "Bilim, tarbiya va kelajak sari"
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Bo‘limlar</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => navigate('schedule')} className="hover:text-blue-400 transition-colors">
                  Dars jadvali (Haftalik / Bugun)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about')} className="hover:text-blue-400 transition-colors">
                  Maktab haqida & Rahbariyat
                </button>
              </li>
              <li>
                <button onClick={() => navigate('teachers')} className="hover:text-blue-400 transition-colors">
                  O‘qituvchilar
                </button>
              </li>
              <li>
                <button onClick={() => navigate('achievements')} className="hover:text-blue-400 transition-colors">
                  Maktabimiz faxrlari
                </button>
              </li>
              <li>
                <button onClick={() => navigate('videos')} className="hover:text-blue-400 transition-colors">
                  Maktabimiz videolari
                </button>
              </li>
              <li>
                <button onClick={() => navigate('announcements')} className="hover:text-blue-400 transition-colors">
                  Rasmiy e’lonlar
                </button>
              </li>
              <li>
                <button onClick={() => navigate('gallery')} className="hover:text-blue-400 transition-colors">
                  Foto galereya
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-blue-400 transition-colors">
                  Bog‘lanish & Murojaat
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Verified Contact & Address */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Rasmiy Manzil</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                <span className="text-slate-300 leading-relaxed">
                  88GG+522, Katput qishlog‘i, Farg‘ona viloyati, O‘zbekiston
                </span>
              </li>
              <li className="flex items-center gap-2.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>O‘zbekiston Respublikasi Maktabgacha va maktab ta’limi vazirligi tasarrufida</span>
              </li>
              <li className="pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Rasmiy Telegram Kanal
                </div>
                <a
                  href={formatTelegramUrl(telegramChannel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-white border border-sky-500/30 transition-all font-bold text-xs group"
                >
                  <TelegramIcon className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span>{formatTelegramHandle(telegramChannel)}</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Leadership & Project Creator */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Rahbariyat & Muallif</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Maktab direktori</div>
                <div className="font-bold text-white text-sm mt-0.5">Sheraliyev Axrorbek</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Direktor o‘rinbosari</div>
                <div className="font-bold text-white text-sm mt-0.5">Boymatov To‘lqinjon</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-amber-400 font-semibold uppercase flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Loyiha yaratuvchisi
                </div>
                <div className="font-bold text-amber-300 text-sm mt-0.5">Karimjonov Shuhratjon</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} 43-Umumiy o‘rta ta’lim maktabi. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Platforma yaratuvchisi:</span>
            <span className="font-bold text-slate-200">Karimjonov Shuhratjon</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
