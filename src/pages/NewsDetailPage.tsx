import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Eye, Share2, Sparkles, Check } from 'lucide-react';
import { NewsArticle } from '../types/index.ts';

interface NewsDetailPageProps {
  slug: string;
  navigate: (route: string) => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ slug, navigate }) => {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/news/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Yangilik topilmadi');
        return res.json();
      })
      .then((data) => setArticle(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Yangilik yuklanmoqda...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Yangilik topilmadi</h2>
        <button
          onClick={() => navigate('news')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm"
        >
          Yangiliklar ro'yxatiga qaytish
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top back navigation */}
      <div>
        <button
          onClick={() => navigate('news')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Barcha yangiliklar
        </button>
      </div>

      {/* Title & Metadata */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{article.category}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <User className="w-4 h-4 text-slate-400" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {new Date(article.publishedAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              {article.views} marta o'qildi
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Nusxa olindi!' : 'Ulashish'}</span>
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-80 sm:h-96 object-cover"
        />
      </div>

      {/* Main Content Body */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
        <div className="text-base sm:text-lg text-slate-700 leading-relaxed whitespace-pre-line space-y-4 font-normal">
          {article.content}
        </div>
      </div>
    </article>
  );
};
