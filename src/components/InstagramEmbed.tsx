import React, { useState, useEffect } from 'react';
import { Instagram, Loader2, ExternalLink } from 'lucide-react';

interface InstagramEmbedProps {
  url: string;
  title?: string;
  className?: string;
  minHeight?: string;
}

export function extractInstagramCode(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  // Support instagram.com/reel/CODE, /reels/CODE, /p/CODE, /tv/CODE, /share/reel/CODE
  const match = clean.match(/instagram\.com\/(?:p|reel|reels|tv|share\/reel)\/([a-zA-Z0-9_-]+)/i);
  return match && match[1] ? match[1] : null;
}

export function getInstagramEmbedUrl(url: string): string | null {
  const code = extractInstagramCode(url);
  if (!code) return null;
  const isReel = /\/(?:reel|reels|share\/reel)\//i.test(url);
  return isReel 
    ? `https://www.instagram.com/reel/${code}/embed/` 
    : `https://www.instagram.com/p/${code}/embed/`;
}

export const InstagramEmbed: React.FC<InstagramEmbedProps> = ({
  url,
  title = "Instagram Video",
  className = "",
  minHeight = "480px",
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const embedUrl = getInstagramEmbedUrl(url);

  // Auto clear loading after timeout if iframe doesn't trigger onLoad
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [embedUrl]);

  // Load Instagram official embed.js once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingScript = document.getElementById('instagram-embed-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'instagram-embed-script';
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      } else if ((window as any).instgrm?.Embeds) {
        (window as any).instgrm.Embeds.process();
      }
    }
  }, [embedUrl]);

  if (!embedUrl) {
    return (
      <div className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 space-y-2 ${className}`}>
        <Instagram className="w-8 h-8 text-pink-500 mx-auto" />
        <p className="text-xs font-semibold">Noto'g'ri yoki aniqlanmagan Instagram havolasi.</p>
        <p className="text-[11px] text-slate-500 break-all">{url}</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-slate-950 flex flex-col items-center justify-center border border-slate-800 ${className}`}>
      {/* Loading state indicator */}
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="text-xs font-medium">Instagram video yuklanmoqda...</span>
        </div>
      )}

      {/* Embedded Iframe */}
      <iframe
        src={embedUrl}
        title={title}
        className="w-full max-w-[500px] border-0 rounded-2xl transition-opacity duration-300"
        style={{ minHeight, height: '580px', opacity: loading ? 0 : 1 }}
        frameBorder="0"
        scrolling="no"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setHasError(true);
        }}
      />

      {/* Direct link fallback if iframe has issues or for user convenience */}
      {hasError && (
        <div className="p-6 text-center space-y-3 max-w-md">
          <Instagram className="w-10 h-10 text-pink-500 mx-auto" />
          <h4 className="font-bold text-sm text-white">Instagram Video</h4>
          <p className="text-xs text-slate-400">
            Ushbu video hisob maxfiyligi sababli brauzerda to'g'ridan-to'g'ri yuklanmadi.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-lg"
          >
            <span>Instagram'da ko'rish</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
