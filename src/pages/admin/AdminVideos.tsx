import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Upload, 
  EyeOff, 
  Play, 
  Instagram, 
  Film, 
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  FileVideo,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { SchoolVideo } from '../../types/index.ts';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';
import { InstagramEmbed, extractInstagramCode, getInstagramEmbedUrl } from '../../components/InstagramEmbed.tsx';

// Validate Instagram URL format
export const isInstagramUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const clean = url.trim();
    if (Boolean(extractInstagramCode(clean))) return true;
    const parsed = new URL(clean);
    const validHosts = ['instagram.com', 'www.instagram.com', 'm.instagram.com'];
    if (!validHosts.includes(parsed.hostname)) return false;
    return /^\/(p|reel|reels|tv|share\/reel)\/([a-zA-Z0-9_-]+)/i.test(parsed.pathname);
  } catch {
    return false;
  }
};

// Generate thumbnail from video file using canvas
export function captureVideoFrame(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      const cleanUp = () => {
        URL.revokeObjectURL(objectUrl);
      };

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1.5, Math.max(0.2, (video.duration || 1) / 4));
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = Math.min(video.videoWidth || 640, 800);
          const height = (width * (video.videoHeight || 360)) / (video.videoWidth || 640);
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            cleanUp();
            resolve(dataUrl);
            return;
          }
        } catch (e) {
          console.warn('Canvas frame capture error:', e);
        }
        cleanUp();
        resolve('');
      };

      video.onerror = () => {
        cleanUp();
        resolve('');
      };

      // Fallback timeout in case seeked doesn't fire
      setTimeout(() => {
        cleanUp();
        resolve('');
      }, 3000);
    } catch {
      resolve('');
    }
  });
}

export const AdminVideos: React.FC = () => {
  const { token } = useAuth();
  const [videos, setVideos] = useState<SchoolVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'upload' | 'instagram'>('all');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SchoolVideo | null>(null);
  const [viewingVideo, setViewingVideo] = useState<SchoolVideo | null>(null);

  // Method tab: 'upload' vs 'instagram'
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'instagram'>('upload');

  // Video File Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localVideoPreviewUrl, setLocalVideoPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoType: 'upload' as 'upload' | 'instagram',
    videoUrl: '',
    thumbnailUrl: '',
    instagramUrl: '',
    isVisible: true,
    order: 1,
  });

  // Deletion state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchVideos = () => {
    setLoading(true);
    fetch('/api/videos?all=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVideos(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (localVideoPreviewUrl) {
        URL.revokeObjectURL(localVideoPreviewUrl);
      }
    };
  }, [localVideoPreviewUrl]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setUploadMethod('upload');
    setSelectedFile(null);
    setLocalVideoPreviewUrl('');
    setUploadProgress(null);
    setUploadDone(false);
    setFormData({
      title: '',
      description: '',
      videoType: 'upload',
      videoUrl: '',
      thumbnailUrl: '',
      instagramUrl: '',
      isVisible: true,
      order: videos.length + 1,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (v: SchoolVideo) => {
    setEditingItem(v);
    setUploadMethod(v.videoType);
    setSelectedFile(null);
    setLocalVideoPreviewUrl('');
    setUploadProgress(null);
    setUploadDone(true);
    setFormData({
      title: v.title,
      description: v.description,
      videoType: v.videoType,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl || '',
      instagramUrl: v.instagramUrl || (v.videoType === 'instagram' ? v.videoUrl : ''),
      isVisible: v.isVisible !== false,
      order: v.order ?? 1,
    });
    setShowModal(true);
  };

  // Video File Upload using XMLHttpRequest for real-time progress
  const uploadVideoFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const uploadData = new FormData();
      uploadData.append('file', file);

      const authToken = token || localStorage.getItem('school_token') || '';

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.url) {
              resolve(data.url);
            } else {
              reject(new Error("Server video manzilini qaytarmadi."));
            }
          } catch {
            reject(new Error("Server javobini o'qishda xatolik yuz berdi."));
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || `Server xatosi (${xhr.status})`));
          } catch {
            reject(new Error(`Video yuklashda xatolik yuz berdi (${xhr.status}).`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Server bilan aloqa uzildi. Iltimos, qayta urinib ko'ring yoki fayl hajmini tekshiring."));
      };

      xhr.ontimeout = () => {
        reject(new Error("Video yuklash vaqti tugadi. Internet tezligini tekshiring."));
      };

      xhr.timeout = 15 * 60 * 1000; // 15 minutes timeout for large files

      xhr.open('POST', '/api/upload/video', true);
      if (authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }
      xhr.send(uploadData);
    });
  };

  // Process chosen video file from laptop/PC
  const handleSelectVideoFile = async (file: File) => {
    setErrorMsg(null);

    // Validate size (up to 500 MB)
    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg("Video hajmi juda katta. Maksimal ruxsat etilgan hajm: 500 MB.");
      return;
    }

    // Set file state and instant local video player preview
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setLocalVideoPreviewUrl(localUrl);

    // If title is empty, prefill with clean file name
    if (!formData.title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setFormData((prev) => ({ ...prev, title: cleanName }));
    }

    // Start background upload to server
    setIsUploadingVideo(true);
    setUploadProgress(0);
    setUploadDone(false);

    // Try auto-capturing a thumbnail frame if no cover yet
    const authToken = token || localStorage.getItem('school_token') || '';
    if (!formData.thumbnailUrl) {
      captureVideoFrame(file).then(async (frameDataUrl) => {
        if (frameDataUrl && !formData.thumbnailUrl) {
          try {
            // Convert dataUrl to blob and upload as real image file
            const blob = await (await fetch(frameDataUrl)).blob();
            const thumbFile = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
            const thumbForm = new FormData();
            thumbForm.append('file', thumbFile);
            const res = await fetch('/api/upload/image', {
              method: 'POST',
              headers: { Authorization: `Bearer ${authToken}` },
              body: thumbForm,
            });
            if (res.ok) {
              const resData = await res.json();
              if (resData.url) {
                setFormData((prev) => ({ ...prev, thumbnailUrl: prev.thumbnailUrl || resData.url }));
                return;
              }
            }
          } catch {
            // Fallback to dataUrl
          }
          setFormData((prev) => ({ ...prev, thumbnailUrl: prev.thumbnailUrl || frameDataUrl }));
        }
      });
    }

    try {
      const serverUrl = await uploadVideoFile(file);
      setFormData((prev) => ({ ...prev, videoUrl: serverUrl }));
      setUploadDone(true);
      setStatusMsg("Video fayl noutbukdan muvaffaqiyatli yuklandi!");
    } catch (err: any) {
      setErrorMsg(err.message || "Video yuklashda xatolik yuz berdi.");
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  // Thumbnail image upload handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg("Iltimos, faqat rasm faylini tanlang (JPG, PNG, WebP).");
      return;
    }

    setUploadingThumbnail(true);
    setErrorMsg(null);

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Muqova yuklashda xatolik.");

      setFormData((prev) => ({ ...prev, thumbnailUrl: data.url }));
      setStatusMsg("Muqova rasmi muvaffaqiyatli yuklandi.");
    } catch (err: any) {
      setErrorMsg(err.message || "Muqova yuklashda xatolik.");
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  const handleToggleVisibility = async (video: SchoolVideo) => {
    try {
      const newVisible = !(video.isVisible !== false);
      const res = await fetch(`/api/videos/${video.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVisible: newVisible }),
      });
      if (!res.ok) throw new Error("Holatni yangilashda xatolik.");
      setStatusMsg(`"${video.title}" holati yangilandi.`);
      fetchVideos();
    } catch (err: any) {
      setErrorMsg(err.message || "Xatolik.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    if (!formData.title.trim()) {
      setErrorMsg("Video nomi kiritilishi shart.");
      return;
    }

    if (uploadMethod === 'instagram') {
      if (!formData.instagramUrl.trim()) {
        setErrorMsg("Instagram video yoki Reel havolasini kiriting.");
        return;
      }
      if (!isInstagramUrl(formData.instagramUrl)) {
        setErrorMsg("Noto'g'ri Instagram havolasi. Masalan: https://www.instagram.com/reel/C.../ yoki https://www.instagram.com/p/... formatida bo'lishi kerak.");
        return;
      }
    } else {
      // Method 1: file upload
      if (isUploadingVideo) {
        setErrorMsg(`Video hali yuklanmoqda (${uploadProgress || 0}%). Iltimos, yuklanish tugashini kuting.`);
        return;
      }
      if (!formData.videoUrl.trim()) {
        setErrorMsg("Iltimos, kompyuteringizdan video fayl tanlang va yuklang.");
        return;
      }
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      videoType: uploadMethod,
      videoUrl: uploadMethod === 'instagram' ? formData.instagramUrl.trim() : formData.videoUrl.trim(),
      instagramUrl: uploadMethod === 'instagram' ? formData.instagramUrl.trim() : undefined,
      thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
      isVisible: formData.isVisible,
      order: Number(formData.order) || 1,
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/videos/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Videoni tahrirlashda xatolik.");
        }
        setStatusMsg("Video muvaffaqiyatli yangilandi.");
      } else {
        const res = await fetch('/api/videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Video qo'shishda xatolik.");
        }
        setStatusMsg("Yangi video muvaffaqiyatli saqlandi.");
      }

      setShowModal(false);
      fetchVideos();
    } catch (err: any) {
      setErrorMsg(err.message || "Xatolik yuz berdi.");
    }
  };

  const requestDelete = (video: SchoolVideo) => {
    setDeleteId(video.id);
    setDeleteTitle(video.title);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/videos/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("O'chirishda xatolik yuz berdi");
      setStatusMsg(`"${deleteTitle}" videosi o'chirildi.`);
      fetchVideos();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const filteredVideos = videos.filter((v) => {
    if (typeFilter !== 'all' && v.videoType !== typeFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-indigo-400" />
            Maktabimiz Videolari Boshqaruvi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Noutbukdan yuklangan video fayllar va saytda to'g'ridan-to'g'ri ko'rinadigan Instagram videolari
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi video qo'shish
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

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Video nomi yoki tavsifi bo'yicha qidiruv..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Barcha videolar</option>
            <option value="upload">Noutbukdan yuklanganlar</option>
            <option value="instagram">Instagram videolari</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 self-end sm:self-center font-medium">
          Jami: <strong className="text-white">{filteredVideos.length}</strong> ta video
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Yuklanmoqda...</div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-800 space-y-3">
          <Video className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">
            {search ? "Qidiruv bo'yicha hech qanday video topilmadi." : "Hozircha videolar kiritilmagan."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Birinchi videoni qo'shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((item) => {
            const isVisible = item.isVisible !== false;
            return (
              <div
                key={item.id}
                className={`bg-slate-900 rounded-3xl overflow-hidden border transition-all flex flex-col justify-between ${
                  isVisible ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/50 opacity-75'
                }`}
              >
                <div>
                  {/* Thumbnail / Video header */}
                  <div className="relative h-44 bg-slate-950 flex items-center justify-center overflow-hidden group">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
                        {item.videoType === 'instagram' ? (
                          <Instagram className="w-12 h-12 text-rose-500/70" />
                        ) : (
                          <Film className="w-12 h-12 text-indigo-500/70" />
                        )}
                      </div>
                    )}

                    {/* Overlay Play Icon */}
                    <button
                      onClick={() => setViewingVideo(item)}
                      className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 flex items-center justify-center transition-all cursor-pointer"
                      title="Videoni tomosha qilish"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </div>
                    </button>

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md ${
                        item.videoType === 'instagram'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}>
                        {item.videoType === 'instagram' ? (
                          <>
                            <Instagram className="w-3 h-3" />
                            Instagram
                          </>
                        ) : (
                          <>
                            <Video className="w-3 h-3" />
                            Maktab videosi
                          </>
                        )}
                      </span>
                    </div>

                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-sm text-slate-300 border border-slate-700">
                      #{item.order ?? 1}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="text-[11px] text-slate-500 font-medium mb-1">
                      {new Date(item.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h4 className="font-extrabold text-sm text-white line-clamp-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleVisibility(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isVisible 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{isVisible ? "Ko'rsatilmoqda" : "Yashirilgan"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingVideo(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Ko'rish"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => requestDelete(item)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Preview Modal (PLAYS DIRECTLY ON THE SITE!) */}
      {viewingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setViewingVideo(null)} />
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white z-10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  viewingVideo.videoType === 'instagram' ? 'bg-pink-600 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {viewingVideo.videoType === 'instagram' ? 'Instagram Video' : 'Maktab videosi'}
                </span>
                <span className="text-xs text-slate-400">Tartib: #{viewingVideo.order ?? 1}</span>
              </div>
              <button onClick={() => setViewingVideo(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Player in Site */}
            {viewingVideo.videoType === 'instagram' ? (
              <div className="space-y-3">
                <InstagramEmbed url={viewingVideo.videoUrl} title={viewingVideo.title} minHeight="520px" />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
                <video
                  src={viewingVideo.videoUrl}
                  controls
                  autoPlay
                  poster={viewingVideo.thumbnailUrl}
                  className="w-full h-full object-contain"
                >
                  Sizning brauzeringiz ushbu videoni ijro eta olmaydi.
                </video>
              </div>
            )}

            <div>
              <h4 className="text-base font-black text-white">{viewingVideo.title}</h4>
              {viewingVideo.description && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {viewingVideo.description}
                </p>
              )}
              <div className="text-[11px] text-slate-500 mt-2">
                Yuklangan sana: {new Date(viewingVideo.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingVideo(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
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
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Film className="w-5 h-5 text-indigo-400" />
                {editingItem ? "Videoni tahrirlash" : "Yangi video qo'shish"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Method Tabs */}
            {!editingItem && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-2xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setUploadMethod('upload')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    uploadMethod === 'upload'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  1-usul: Noutbukdan video yuklash
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('instagram')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    uploadMethod === 'instagram'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Instagram className="w-4 h-4" />
                  2-usul: Instagram videosi
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Video nomi *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: 43-maktabda o'tkazilgan Navro'z bayrami"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Qisqacha tavsif</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Video mazmuni va o'tkazilgan tadbir haqida qisqacha ma'lumot..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* METHOD 1: Video File Upload from Laptop */}
              {uploadMethod === 'upload' && (
                <div className="space-y-3 p-4 bg-slate-800/70 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                      <FileVideo className="w-4 h-4 text-indigo-400" />
                      <span>Noutbukdan video fayl tanlash *</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Maksimal hajm: 500 MB
                    </span>
                  </div>

                  {/* Hidden file input supporting all video types */}
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*,.mp4,.webm,.mov,.m4v,.mkv,.avi,.3gp,.flv,.wmv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleSelectVideoFile(f);
                    }}
                    id="admin-video-file-input"
                  />

                  {/* Drag-and-drop & Clickable Zone */}
                  <div
                    onClick={() => {
                      if (!isUploadingVideo) {
                        videoInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleSelectVideoFile(f);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                      dragOver 
                        ? 'border-indigo-400 bg-indigo-500/15' 
                        : 'border-slate-700 hover:border-indigo-500/60 bg-slate-900/60'
                    }`}
                  >
                    {isUploadingVideo ? (
                      <div className="space-y-2 py-3">
                        <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Noutbukdan serverga yuklanmoqda...
                          </span>
                          <span>{uploadProgress ?? 0}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full transition-all duration-150"
                            style={{ width: `${uploadProgress ?? 0}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {selectedFile?.name} ({(selectedFile?.size ? (selectedFile.size / (1024 * 1024)).toFixed(1) : 0)} MB)
                        </p>
                      </div>
                    ) : (localVideoPreviewUrl || formData.videoUrl) ? (
                      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl text-emerald-300 font-bold text-xs">
                          <span className="flex items-center gap-1.5 truncate">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            {selectedFile ? selectedFile.name : formData.videoUrl.split('/').pop()}
                          </span>
                          <span className="text-[11px] text-emerald-400 shrink-0">
                            {uploadDone ? "Yuklandi ✓" : "Tanlandi"}
                          </span>
                        </div>

                        {/* Video Player Preview directly in admin */}
                        <div className="rounded-xl overflow-hidden bg-black border border-slate-700 max-h-48 flex items-center justify-center">
                          <video
                            src={localVideoPreviewUrl || formData.videoUrl}
                            controls
                            className="max-h-48 w-full object-contain"
                          />
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            Boshqa video tanlash
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-3">
                        <Upload className="w-9 h-9 text-indigo-400 mx-auto" />
                        <div>
                          <span className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline">
                            Kompyuterdan video fayl tanlang
                          </span>
                          <span className="text-slate-400 text-xs"> yoki faylni shu yerga sudrab olib keling</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Formatlar: MP4, WebM, MOV, AVI, MKV. Maksimal hajm: 500 MB.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* METHOD 2: Instagram Video Link with LIVE IN-PAGE PREVIEW */}
              {uploadMethod === 'instagram' && (
                <div className="space-y-3 p-4 bg-slate-800/70 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-pink-400 font-bold">
                    <Instagram className="w-4 h-4" />
                    <span>Instagram Video yoki Reel havolasi *</span>
                  </div>

                  <div>
                    <input
                      type="url"
                      required={uploadMethod === 'instagram'}
                      value={formData.instagramUrl}
                      onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                      placeholder="https://www.instagram.com/reel/C.../ yoki https://www.instagram.com/p/.../"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Maktabning rasmiy Instagram sahifasidagi video yoki Reel havolasi. Video saytning o'zida to'g'ridan-to'g'ri ijro etiladi.
                    </p>
                  </div>

                  {formData.instagramUrl && (
                    <div className="space-y-2 pt-1">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          {isInstagramUrl(formData.instagramUrl) ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="text-emerald-300 font-medium">Havola to'g'ri tekshirildi (Saytda ko'rinadi)</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              <span className="text-rose-400 font-medium">Noto'g'ri Instagram havolasi</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Live in-page preview */}
                      {isInstagramUrl(formData.instagramUrl) && (
                        <div className="mt-2">
                          <span className="text-[11px] font-bold text-slate-400 block mb-1">
                            Saytda ko'rinish namunasi:
                          </span>
                          <InstagramEmbed url={formData.instagramUrl} minHeight="420px" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Video Thumbnail (Muqova rasmi) */}
              <div className="space-y-2 p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">Muqova rasmi (Thumbnail)</label>
                  <span className="text-[11px] text-slate-400">Ixtiyoriy (Videodan avtomatik olinadi)</span>
                </div>

                <div className="flex items-center gap-3">
                  {formData.thumbnailUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-600 shrink-0">
                      <img
                        src={formData.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center text-slate-500 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailUpload}
                      accept="image/*"
                      className="hidden"
                      id="video-thumbnail-input"
                    />
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="video-thumbnail-input"
                        className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingThumbnail ? "Yuklanmoqda..." : "Muqova tanlash"}
                      </label>
                      {formData.thumbnailUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                          className="px-2 py-1 text-slate-400 hover:text-rose-400 text-xs cursor-pointer"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="yoki muqova rasm havolasini kiriting: https://..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order and Visibility */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Ko'rinish tartib raqami</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Asosiy sahifada ko'rsatish</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      formData.isVisible
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {formData.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{formData.isVisible ? "Ha, ko'rsatilsin" : "Yashirilsin"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploadingVideo}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-black text-white text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploadingVideo && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isUploadingVideo 
                      ? `Video yuklanishi kutilmoqda (${uploadProgress || 0}%)...` 
                      : editingItem 
                        ? "O'zgarishlarni saqlash" 
                        : "Videoni saqlash"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="O'chirishni tasdiqlash"
        message={`Haqiqatan ham "${deleteTitle}" videosini ro'yxatdan o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
