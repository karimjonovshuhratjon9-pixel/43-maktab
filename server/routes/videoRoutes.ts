import { Router, Request, Response } from 'express';
import { dbService } from '../db/database.ts';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import { SchoolVideo } from '../db/types.ts';

const router = Router();

// Validate Instagram video/reel URL pattern
export function isValidInstagramUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    const validHosts = ['instagram.com', 'www.instagram.com', 'm.instagram.com'];
    if (!validHosts.includes(parsed.hostname)) return false;
    // Allow /p/:id, /reel/:id, /tv/:id
    const validPath = /^\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/;
    return validPath.test(parsed.pathname);
  } catch {
    return false;
  }
}

// GET /api/videos - Public or Admin list
router.get('/', (req: Request, res: Response) => {
  try {
    const showAll = req.query.all === 'true';
    const videos = dbService.getVideos(!showAll);
    res.json(videos);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Videolar ro'yxatini olishda xatolik." });
  }
});

// GET /api/videos/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const video = dbService.getVideoById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: "Video topilmadi." });
    }
    res.json(video);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Xatolik." });
  }
});

// POST /api/videos (Admin only)
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      title, 
      description, 
      videoType, 
      videoUrl, 
      thumbnailUrl, 
      instagramUrl, 
      duration, 
      isVisible, 
      order 
    } = req.body;

    const trimmedTitle = (title || '').trim();
    if (!trimmedTitle) {
      return res.status(400).json({ error: "Video nomi kiritilishi shart." });
    }

    const type = videoType === 'instagram' ? 'instagram' : 'upload';
    let finalVideoUrl = (videoUrl || '').trim();

    if (type === 'instagram') {
      const igUrl = (instagramUrl || finalVideoUrl).trim();
      if (!isValidInstagramUrl(igUrl)) {
        return res.status(400).json({ 
          error: "Noto'g'ri Instagram havolasi. Iltimos, haqiqiy Instagram post yoki Reel havolasini kiriting (masalan: https://www.instagram.com/reel/C.../)." 
        });
      }
      finalVideoUrl = igUrl;
    } else {
      if (!finalVideoUrl) {
        return res.status(400).json({ error: "Yuklangan video fayli manzili talab qilinadi." });
      }
    }

    const newVideo: SchoolVideo = {
      id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: trimmedTitle,
      description: (description || '').trim(),
      videoType: type,
      videoUrl: finalVideoUrl,
      thumbnailUrl: (thumbnailUrl || '').trim(),
      instagramUrl: type === 'instagram' ? finalVideoUrl : undefined,
      duration: duration?.trim(),
      isVisible: isVisible !== false,
      order: typeof order === 'number' ? order : 1,
      createdAt: new Date().toISOString(),
    };

    const saved = dbService.createVideo(newVideo);
    dbService.logActivity(
      req.user?.username || 'Admin', 
      'VIDEO_CREATE', 
      `Yangi video qo'shildi: ${trimmedTitle} (${type === 'instagram' ? 'Instagram' : 'Fayl'})`
    );

    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Video qo'shishda xatolik." });
  }
});

// PUT /api/videos/:id (Admin only)
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updates: Partial<SchoolVideo> = {};
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description.trim();
    if (body.thumbnailUrl !== undefined) updates.thumbnailUrl = body.thumbnailUrl.trim();
    if (body.duration !== undefined) updates.duration = body.duration.trim();
    if (body.isVisible !== undefined) updates.isVisible = Boolean(body.isVisible);
    if (body.order !== undefined) updates.order = Number(body.order);

    if (body.videoType === 'instagram' && body.instagramUrl) {
      if (!isValidInstagramUrl(body.instagramUrl)) {
        return res.status(400).json({ error: "Noto'g'ri Instagram havolasi." });
      }
      updates.videoType = 'instagram';
      updates.instagramUrl = body.instagramUrl.trim();
      updates.videoUrl = body.instagramUrl.trim();
    } else if (body.videoUrl) {
      updates.videoUrl = body.videoUrl.trim();
    }

    const updated = dbService.updateVideo(id, updates);
    if (!updated) {
      return res.status(404).json({ error: "Video topilmadi." });
    }

    dbService.logActivity(
      req.user?.username || 'Admin', 
      'VIDEO_UPDATE', 
      `Video tahrirlandi: ${updated.title}`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Videoni yangilashda xatolik." });
  }
});

// DELETE /api/videos/:id (Admin only)
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const video = dbService.getVideoById(id);
    const success = dbService.deleteVideo(id);
    if (!success) {
      return res.status(404).json({ error: "O'chirish uchun video topilmadi." });
    }

    dbService.logActivity(
      req.user?.username || 'Admin', 
      'VIDEO_DELETE', 
      `Video o'chirildi: ${video?.title || id}`
    );

    res.json({ success: true, message: "Video muvaffaqiyatli o'chirildi." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Videoni o'chirishda xatolik." });
  }
});

export default router;
