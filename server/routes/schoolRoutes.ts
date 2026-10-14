import { Router, Request, Response } from 'express';
import { dbService } from '../db/database.ts';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';

const router = Router();

// GET /api/school - Public school info and leadership
router.get('/', (_req: Request, res: Response) => {
  try {
    const school = dbService.getSchoolInfo();
    const leadership = dbService.getLeadership();
    res.json({ school, leadership });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Maktab ma\'lumotlarini olishda xatolik.' });
  }
});

// PUT /api/school - Admin update school info
router.put('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    const updated = dbService.updateSchoolInfo(updates);
    dbService.logActivity(req.user?.username || 'Admin', 'SCHOOL_UPDATE', 'Maktab ma\'lumotlari yangilandi');
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Maktab ma\'lumotlarini yangilashda xatolik.' });
  }
});

// PUT /api/school/leadership - Admin update leadership
router.put('/leadership', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { leadership } = req.body;
    if (!Array.isArray(leadership)) {
      return res.status(400).json({ error: 'Rahbariyat ro\'yxati massiv bo\'lishi kerak.' });
    }
    const updated = dbService.updateLeadership(leadership);
    dbService.logActivity(req.user?.username || 'Admin', 'LEADERSHIP_UPDATE', 'Rahbariyat ma\'lumotlari yangilandi');
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Rahbariyat ma\'lumotlarini yangilashda xatolik.' });
  }
});

export default router;
