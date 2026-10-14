import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Target, 
  Compass, 
  ShieldCheck, 
  MapPin, 
  UserCheck,
  Code,
  ExternalLink
} from 'lucide-react';
import { TelegramIcon } from '../components/TelegramIcon.tsx';
import { formatTelegramUrl, formatTelegramHandle } from '../utils/telegram.ts';

interface SchoolData {
  school: {
    name: string;
    fullName: string;
    address: string;
    creator: string;
    telegramChannel?: string;
  };
  leadership: {
    id: string;
    role: string;
    fullName: string;
    bio?: string;
  }[];
}

export const AboutPage: React.FC = () => {
  const [data, setData] = useState<SchoolData>({
    school: {
      name: '43-maktab',
      fullName: 'Farg‘ona viloyati 43-umumiy o‘rta ta’lim maktabi',
      address: '88GG+522, Katput qishlog‘i, Farg‘ona viloyati, O‘zbekiston',
      creator: 'Karimjonov Shuhratjon',
    },
    leadership: [
      {
        id: 'ldr-1',
        role: 'Maktab direktori',
        fullName: 'Sheraliyev Axrorbek',
        bio: '43-umumiy o‘rta ta’lim maktabi direktori',
      },
      {
        id: 'ldr-2',
        role: 'Direktor o‘rinbosari',
        fullName: 'Boymatov To‘lqinjon',
        bio: 'O‘quv-tarbiyaviy ishlar bo‘yicha direktor o‘rinbosari',
      },
      {
        id: 'ldr-3',
        role: 'Maktab psixologi',
        fullName: 'Abdullayev Anvarjon',
        bio: '43-umumiy o‘rta ta’lim maktabi amaliyotchi psixologi',
      },
    ],
  });

  useEffect(() => {
    fetch('/api/school')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.school) {
          setData(resData);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Header Hero */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Maktab haqida rasmiy ma'lumot</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            {data.school.fullName}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Bizning maktabimiz — sifatli ta'lim, mustahkam ma'naviyat va zamonaviy tafakkur uyg'unlashgan ilm maskani.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-blue-300">
              <MapPin className="w-4 h-4 shrink-0 text-blue-400" />
              <span>{data.school.address}</span>
            </div>

            <a
              href={formatTelegramUrl(data.school.telegramChannel)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white border border-sky-400/30 font-bold transition-all shadow-sm"
            >
              <TelegramIcon className="w-4 h-4 text-sky-400" />
              <span>Rasmiy Telegram: {formatTelegramHandle(data.school.telegramChannel)}</span>
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Rahbariyat Section */}
      <section className="space-y-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Ma'muriyat</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Maktab rahbariyati
          </h2>
          <p className="text-sm text-slate-500">
            43-umumiy o‘rta ta’lim maktabining tasdiqlangan rahbariyati
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.leadership.map((leader) => (
            <div key={leader.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl mb-4">
                  {leader.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
                  {leader.role}
                </span>
                <h4 className="text-lg font-black text-slate-900">{leader.fullName}</h4>
                {leader.bio && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{leader.bio}</p>
                )}
              </div>
            </div>
          ))}

          {/* Project Creator Card */}
          <div className="bg-gradient-to-b from-amber-50/50 to-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl mb-4">
                KS
              </div>
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Code className="w-3.5 h-3.5" />
                Loyiha yaratuvchisi
              </span>
              <h4 className="text-lg font-black text-slate-900">{data.school.creator}</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                43-maktab rasmiy web-platformasi dasturchisi va axborot tizimi me'mori.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Missiya va Maqsadlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Maktab missiyasi</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Har bir o‘quvchining shaxsiy layoqati va iqtidorini kashf etish, ularga chuqur bilim berish va vatanparvar, komil inson sifatida kamol toptirish.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Asosiy maqsadlar</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            O‘quvchilarning tanqidiy fikrlashi va ijodiy salohiyatini rivojlantirish, mustahkam intellektual poydevor yaratish.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Qadriyatlarimiz</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Adolat, halollik, o‘zaro hurmat, ilmga muhabbat, pedagoglar va ota-onalar o‘rtasidagi doimiy hamkorlik.
          </p>
        </div>
      </div>
    </div>
  );
};
