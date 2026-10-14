import { Router, Request, Response } from 'express';
import { dbService } from '../db/database.ts';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import { SchoolAchievement } from '../db/types.ts';

const router = Router();

// GET /api/achievements - Public or Admin list
router.get('/', (req: Request, res: Response) => {
  try {
    const showAll = req.query.all === 'true';
    const items = dbService.getAchievements(!showAll);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Faxrli o'quvchilar ro'yxatini olishda xatolik." });
  }
});

// GET /api/achievements/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const item = dbService.getAchievementById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Ma'lumot topilmadi." });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Xatolik." });
  }
});

// POST /api/achievements (Admin only)
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      fullName, 
      studentName, 
      title, 
      contest, 
      place, 
      year, 
      className, 
      category, 
      imageUrl, 
      achievementDetails, 
      description,
      isVisible,
      order 
    } = req.body;

    const name = (fullName || studentName || '').trim();
    const contestTitle = (title || contest || '').trim();
    const details = (achievementDetails || description || '').trim();

    if (!name) {
      return res.status(400).json({ error: "Ism va familiya kiritilishi shart." });
    }
    if (!contestTitle) {
      return res.status(400).json({ error: "Yutuq yoki musobaqa nomi kiritilishi shart." });
    }

    const newItem: SchoolAchievement = {
      id: `ach-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: name,
      studentName: name,
      title: contestTitle,
      contest: contestTitle,
      place: (place || "1-o'rin").trim(),
      year: Number(year) || new Date().getFullYear(),
      className: (className || '').trim(),
      category: (category || 'Olimpiada').trim(),
      imageUrl: (imageUrl || '').trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      achievementDetails: details,
      description: details,
      isVisible: isVisible !== false,
      order: typeof order === 'number' ? order : 1,
      createdAt: new Date().toISOString(),
    };

    const saved = dbService.createAchievement(newItem);
    dbService.logActivity(
      req.user?.username || 'Admin', 
      'ACHIEVEMENT_CREATE', 
      `Yangi faxrli inson qo'shildi: ${name} (${contestTitle})`
    );

    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Yangi faxrli inson qo'shishda xatolik." });
  }
});

// PUT /api/achievements/:id (Admin only)
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updates: Partial<SchoolAchievement> = {};
    if (body.fullName !== undefined || body.studentName !== undefined) {
      const name = (body.fullName || body.studentName || '').trim();
      updates.fullName = name;
      updates.studentName = name;
    }
    if (body.title !== undefined || body.contest !== undefined) {
      const c = (body.title || body.contest || '').trim();
      updates.title = c;
      updates.contest = c;
    }
    if (body.place !== undefined) updates.place = body.place.trim();
    if (body.year !== undefined) updates.year = Number(body.year);
    if (body.className !== undefined) updates.className = body.className.trim();
    if (body.category !== undefined) updates.category = body.category.trim();
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl.trim();
    if (body.achievementDetails !== undefined || body.description !== undefined) {
      const d = (body.achievementDetails || body.description || '').trim();
      updates.achievementDetails = d;
      updates.description = d;
    }
    if (body.isVisible !== undefined) updates.isVisible = Boolean(body.isVisible);
    if (body.order !== undefined) updates.order = Number(body.order);

    const updated = dbService.updateAchievement(id, updates);
    if (!updated) {
      return res.status(404).json({ error: "Faxrli inson ma'lumoti topilmadi." });
    }

    dbService.logActivity(
      req.user?.username || 'Admin',
      'ACHIEVEMENT_UPDATE',
      `Faxrli inson tahrirlandi: ${updated.fullName || updated.studentName}`
    );

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Ma'lumotni yangilashda xatolik." });
  }
});

// DELETE /api/achievements/:id (Admin only)
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const item = dbService.getAchievementById(id);
    const success = dbService.deleteAchievement(id);
    if (!success) {
      return res.status(404).json({ error: "O'chirish uchun ma'lumot topilmadi." });
    }

    dbService.logActivity(
      req.user?.username || 'Admin',
      'ACHIEVEMENT_DELETE',
      `Faxrli inson o'chirildi: ${item?.fullName || item?.studentName || id}`
    );

    res.json({ success: true, message: "Muvaffaqiyatli o'chirildi." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "O'chirishda xatolik." });
  }
});

export default router;
