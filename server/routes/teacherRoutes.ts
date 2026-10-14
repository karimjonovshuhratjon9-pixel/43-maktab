import { Router, Request, Response } from 'express';
import { dbService } from '../db/database.ts';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';

const router = Router();

// GET /api/teachers
router.get('/', (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string)?.toLowerCase() || '';
    const subject = (req.query.subject as string) || '';

    let teachers = dbService.getTeachers();

    if (query) {
      teachers = teachers.filter(
        (t) =>
          t.fullName.toLowerCase().includes(query) ||
          t.subject.toLowerCase().includes(query) ||
          (t.bio && t.bio.toLowerCase().includes(query))
      );
    }

    if (subject && subject !== 'Hammasi') {
      teachers = teachers.filter((t) => t.subject.toLowerCase().includes(subject.toLowerCase()));
    }

    res.json(teachers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'O\'qituvchilarni olishda xatolik.' });
  }
});

// POST /api/teachers (Admin only)
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, subject, roleTitle, experienceYears, bio, imageUrl, phone, email, isFeatured } = req.body;
    if (!fullName || !subject) {
      return res.status(400).json({ error: 'Ism-familiya va fan kiritilishi shart.' });
    }

    const newTeacher = dbService.createTeacher({
      id: `tch-${Date.now()}`,
      fullName,
      subject,
      roleTitle: roleTitle || 'O\'qituvchi',
      experienceYears: Number(experienceYears) || 1,
      bio: bio || '',
      imageUrl: imageUrl || '/default-teacher.png',
      phone: phone || '',
      email: email || '',
      isFeatured: !!isFeatured,
    });

    dbService.logActivity(req.user?.username || 'Admin', 'TEACHER_CREATE', `Yangi o'qituvchi qo'shildi: ${fullName}`);
    res.status(201).json(newTeacher);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'O\'qituvchini saqlashda xatolik.' });
  }
});

// PUT /api/teachers/:id (Admin only)
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = dbService.updateTeacher(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'O\'qituvchi topilmadi.' });
    }
    dbService.logActivity(req.user?.username || 'Admin', 'TEACHER_UPDATE', `O'qituvchi tahrirlandi: ${updated.fullName}`);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'O\'qituvchini yangilashda xatolik.' });
  }
});

// DELETE /api/teachers/:id (Admin only)
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = dbService.deleteTeacher(id);
    if (!ok) {
      return res.status(404).json({ error: 'O\'qituvchi topilmadi.' });
    }
    dbService.logActivity(req.user?.username || 'Admin', 'TEACHER_DELETE', `O'qituvchi o'chirildi (ID: ${id})`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'O\'qituvchini o\'chirishda xatolik.' });
  }
});

export default router;
