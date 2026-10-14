import { Router, Request, Response } from 'express';
import { dbService } from '../db/database.ts';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';

const router = Router();

// GET /api/gallery
router.get('/', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    let items = dbService.getGallery();
    if (category && category !== 'Hammasi') {
      items = items.filter((i) => i.category && i.category.toLowerCase() === category.toLowerCase());
    }
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Galereyani olishda xatolik.' });
  }
});

// POST /api/gallery (Admin only)
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, imageUrl, description } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Rasm sarlavhasi va havolasi (URL) kiritilishi shart.' });
    }

    const newItem = dbService.createGalleryItem({
      id: `gal-${Date.now()}`,
      title,
      category: category || 'Maktab',
      imageUrl,
      description: description || '',
      createdAt: new Date().toISOString(),
    });

    dbService.logActivity(req.user?.username || 'Admin', 'GALLERY_ADD', `Galereyaga rasm qo'shildi: ${title}`);
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Rasm saqlashda xatolik.' });
  }
});

// DELETE /api/gallery/:id (Admin only)
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = dbService.deleteGalleryItem(id);
    if (!ok) {
      return res.status(404).json({ error: 'Rasm topilmadi.' });
    }
    dbService.logActivity(req.user?.username || 'Admin', 'GALLERY_DELETE', `Galereyadan rasm o'chirildi (ID: ${id})`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Rasmni o\'chirishda xatolik.' });
  }
});

export default router;
