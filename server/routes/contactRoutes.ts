import { Router, Request, Response } from 'express';
import { dbService } from '../db/database.ts';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';

const router = Router();

// POST /api/contact - Public contact submission
router.post('/', (req: Request, res: Response) => {
  try {
    const { fullName, phone, email, subject, message } = req.body;
    if (!fullName || !phone || !message) {
      return res.status(400).json({ error: 'Ism, telefon raqami va murojaat matni to\'ldirilishi shart.' });
    }

    const newMessage = dbService.createMessage({
      id: `msg-${Date.now()}`,
      fullName,
      phone,
      email: email || '',
      subject: subject || 'Umumiy murojaat',
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Murojaatingiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog\'lanamiz.',
      id: newMessage.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Murojaatni yuborishda xatolik.' });
  }
});

// GET /api/messages (Admin only)
router.get('/messages', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const messages = dbService.getMessages();
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Xabarlarni olishda xatolik.' });
  }
});

// PATCH /api/messages/:id/read (Admin only)
router.patch('/messages/:id/read', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;
    const ok = dbService.markMessageRead(id, isRead !== undefined ? !!isRead : true);
    if (!ok) {
      return res.status(404).json({ error: 'Xabar topilmadi.' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Xatolik.' });
  }
});

// DELETE /api/messages/:id (Admin only)
router.delete('/messages/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = dbService.deleteMessage(id);
    if (!ok) {
      return res.status(404).json({ error: 'Xabar topilmadi.' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Xabarni o\'chirishda xatolik.' });
  }
});

export default router;
