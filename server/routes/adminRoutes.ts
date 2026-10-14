import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbService } from '../db/database.ts';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';

const router = Router();

// GET /api/admin/stats
router.get('/stats', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = dbService.getAdminStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Statistikani olishda xatolik.' });
  }
});

// GET /api/admin/activity-logs
router.get('/activity-logs', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = dbService.getActivityLogs(30);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Faoliyat tarixini olishda xatolik.' });
  }
});

// POST /api/admin/change-password
router.post('/change-password', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Joriy parol va yangi parol kiritilishi shart.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Yangi parol kamida 6 belgidan iborat bo\'lishi kerak.' });
    }

    const user = dbService.findUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: 'Joriy parol noto\'g\'ri.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    dbService.updateUserPassword(user.id, newHash);
    dbService.logActivity(user.username, 'PASSWORD_CHANGE', 'Admin paroli muvaffaqiyatli o\'zgartirildi');

    res.json({ success: true, message: 'Parol muvaffaqiyatli yangilandi.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Parolni o\'zgartirishda xatolik.' });
  }
});

// POST /api/admin/reseed - Reset / Reseed database with verified data
router.post('/reseed', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await dbService.reseed();
    dbService.logActivity(req.user?.username || 'Admin', 'SYSTEM_RESEED', 'Baza qayta tasdiqlangan boshlang\'ich holatga keltirildi');
    res.json({ success: true, message: 'Baza qayta tiklandi.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Xatolik.' });
  }
});

export default router;
