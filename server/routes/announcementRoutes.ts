import { Router, Request, Response } from 'express';
import { dbService } from '../db/database.ts';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';

const router = Router();

// GET /api/announcements
router.get('/', (_req: Request, res: Response) => {
  try {
    const list = dbService.getAnnouncements(true);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'E\'lonlarni olishda xatolik.' });
  }
});

// GET /api/announcements/admin
router.get('/admin', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const list = dbService.getAnnouncements(false);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'E\'lonlarni olishda xatolik.' });
  }
});

// POST /api/announcements (Admin only)
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, category, isPinned, targetAudience, expiryDate } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Sarlavha va matn kiritilishi shart.' });
    }

    const newAnn = dbService.createAnnouncement({
      id: `ann-${Date.now()}`,
      title,
      content,
      category: category || 'Umumiy',
      isPinned: !!isPinned,
      isActive: true,
      targetAudience: targetAudience || 'all',
      expiryDate: expiryDate || undefined,
      createdAt: new Date().toISOString(),
    });

    dbService.logActivity(req.user?.username || 'Admin', 'ANNOUNCEMENT_CREATE', `E'lon joylandi: ${title}`);
    res.status(201).json(newAnn);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'E\'lon yaratishda xatolik.' });
  }
});

// PUT /api/announcements/:id (Admin only)
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = dbService.updateAnnouncement(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'E\'lon topilmadi.' });
    }
    dbService.logActivity(req.user?.username || 'Admin', 'ANNOUNCEMENT_UPDATE', `E'lon tahrirlandi: ${updated.title}`);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'E\'lonni yangilashda xatolik.' });
  }
});

// DELETE /api/announcements/:id (Admin only)
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = dbService.deleteAnnouncement(id);
    if (!ok) {
      return res.status(404).json({ error: 'E\'lon topilmadi.' });
    }
    dbService.logActivity(req.user?.username || 'Admin', 'ANNOUNCEMENT_DELETE', `E'lon o'chirildi (ID: ${id})`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'E\'lonni o\'chirishda xatolik.' });
  }
});

export default router;
