import React, { useState, useEffect } from 'react';
import { Bell, ArrowRight, Calendar, User, Eye } from 'lucide-react';
import { NewsArticle } from '../types/index.ts';

interface NewsPageProps {
  navigate: (route: string) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ navigate }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Hammasi');
  const [loading, setLoading] = useState(true);

  const categories = ['Hammasi', 'O\'quv jarayoni', 'Yutuqlar', 'Ma\'naviyat', 'E\'lonlar'];

  useEffect(() => {
    setLoading(true);
    let url = '/api/news';
    if (selectedCategory !== 'Hammasi') {
      url += `?category=${encodeURIComponent(selectedCategory)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNews(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Bell className="w-3.5 h-3.5" />
            <span>Maktab Hayoti</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Yangiliklar va Xabarlar
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            43-maktabda o'tkazilayotgan so'nggi tadbirlar, ilmiy anjumanlar va muhim hodisalar.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Yangiliklar yuklanmoqda...
        </div>
      ) : news.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-slate-200">
          Ushbu toifada yangiliklar mavjud emas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <article
              key={item.id}
              onClick={() => navigate(`news/${item.slug}`)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-white border border-slate-700">
                    {item.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.publishedAt).toLocaleDateString('uz-UZ')}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {item.views}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2.5 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-0 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Batafsil o'qish</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
