import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { GalleryItem } from '../types/index.ts';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Hammasi');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = ['Hammasi', 'Maktab', 'Tadbirlar', 'Sport', 'Olimpiadalar', 'O\'quv jarayoni'];

  useEffect(() => {
    setLoading(true);
    let url = '/api/gallery';
    if (selectedCategory !== 'Hammasi') {
      url += `?category=${encodeURIComponent(selectedCategory)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
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
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto lavhalar</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Maktab Galereyasi
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Maktabimizning o'quv jarayoni, sport musobaqalari, bayram tadbirlari va kundalik hayotidan yorqin foto lavhalar.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
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

      {/* Photo Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Fotolar yuklanmoqda...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-slate-200">
          Ushbu toifada rasmlar mavjud emas.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-72"
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider mb-2 inline-block">
                  {photo.category}
                </span>
                <h4 className="font-extrabold text-base leading-snug text-white">
                  {photo.title}
                </h4>
                {photo.description && (
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {photo.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setActivePhoto(null)}
          />
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 z-10 shadow-2xl">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white z-20"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.title}
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <div className="p-6 text-white bg-slate-900 border-t border-slate-800">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                {activePhoto.category}
              </span>
              <h3 className="text-xl font-bold mt-1">{activePhoto.title}</h3>
              {activePhoto.description && (
                <p className="text-sm text-slate-300 mt-1">{activePhoto.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
