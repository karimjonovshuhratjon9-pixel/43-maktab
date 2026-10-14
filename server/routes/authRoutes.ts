import { Router, Request, Response } from 'express';
import { AuthService } from '../auth/authService.ts';
import { requireAuth, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import { dbService } from '../db/database.ts';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Foydalanuvchi nomi va parol kiritilishi shart.' });
    }

    const result = await AuthService.login(username, password, role);

    if (result.user.role === 'ADMIN') {
      dbService.logActivity(result.user.username, 'LOGIN', 'Admin tizimga kirdi');
    }

    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Kirish muvaffaqiyatsiz bo\'ldi.' });
  }
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = dbService.findUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server xatosi.' });
  }
});

export default router;
