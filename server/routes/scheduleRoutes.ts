import { Router, Request, Response } from 'express';
import multer from 'multer';
import { dbService } from '../db/database.ts';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import { parseScheduleExcel, generateSampleExcelBuffer } from '../excel/excelParser.ts';
import { WeekDay, ScheduleItem, ScheduleVersion } from '../db/types.ts';
import { LESSON_TIMES } from '../db/seedData.ts';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const isExcel =
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls') ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel';

    if (isExcel) {
      cb(null, true);
    } else {
      cb(new Error('Excel fayl formati noto\'g\'ri. Faqat .xlsx va .xls formatidagi fayllar qabul qilinadi.'));
    }
  },
});

// GET /api/classes
router.get('/classes', (_req: Request, res: Response) => {
  try {
    const classes = dbService.getClasses();
    res.json(classes);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sinflarni yuklashda xatolik.' });
  }
});

// POST /api/schedule/classes (Admin only)
router.post('/classes', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, grade, shift, room, classTeacher } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Sinf nomi kiritilishi shart.' });
    }

    const newClass = dbService.createClass({
      id: `cls-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
      name: name.trim().toUpperCase(),
      grade: Number(grade) || parseInt(name, 10) || 1,
      shift: Number(shift) || 1,
      room: room || '',
      classTeacher: classTeacher || '',
    });

    dbService.logActivity(req.user?.username || 'Admin', 'CLASS_CREATE', `Yangi sinf qo‘shildi: ${newClass.name}`);
    res.status(201).json(newClass);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sinf yaratishda xatolik.' });
  }
});

// PUT /api/schedule/classes/:id (Admin only)
router.put('/classes/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, grade, shift, room, classTeacher } = req.body;
    const updated = dbService.updateClass(id, {
      ...(name ? { name: name.trim().toUpperCase() } : {}),
      ...(grade !== undefined ? { grade: Number(grade) } : {}),
      ...(shift !== undefined ? { shift: Number(shift) } : {}),
      ...(room !== undefined ? { room } : {}),
      ...(classTeacher !== undefined ? { classTeacher } : {}),
    });
    if (!updated) {
      return res.status(404).json({ error: 'Sinf topilmadi.' });
    }
    dbService.logActivity(req.user?.username || 'Admin', 'CLASS_UPDATE', `Sinf tahrirlandi: ${updated.name}`);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sinfni yangilashda xatolik.' });
  }
});

// DELETE /api/schedule/classes/:id (Admin only)
router.delete('/classes/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = dbService.deleteClass(id);
    if (!ok) {
      return res.status(404).json({ error: 'Sinf topilmadi.' });
    }
    dbService.logActivity(req.user?.username || 'Admin', 'CLASS_DELETE', `Sinf o‘chirildi (ID: ${id})`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sinfni o‘chirishda xatolik.' });
  }
});

// GET /api/schedule?class=8A&versionId=...
router.get('/', (req: Request, res: Response) => {
  try {
    const className = (req.query.class as string) || '';
    const versionId = (req.query.versionId as string) || undefined;

    const schedules = dbService.getSchedules(className, versionId);
    const activeVersion = dbService.getActiveScheduleVersion();

    res.json({
      className,
      version: activeVersion,
      totalLessons: schedules.length,
      schedule: schedules,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Dars jadvalini olishda xatolik yuz berdi.' });
  }
});

// GET /api/schedule/today?class=8A
router.get('/today', (req: Request, res: Response) => {
  try {
    const className = (req.query.class as string) || '';
    if (!className) {
      return res.status(400).json({ error: 'Sinf tanlanishi shart.' });
    }

    const schedules = dbService.getSchedules(className);

    // Determine current day of week and exact time in Asia/Tashkent (UTC+5)
    let currentHours = 0;
    let currentMinutes = 0;
    let dayOfWeek = 1;

    // Check if client supplied valid clientTime (e.g. "10:30")
    const clientTimeParam = req.query.clientTime as string;
    if (clientTimeParam && /^\d{1,2}:\d{2}$/.test(clientTimeParam)) {
      const [ch, cm] = clientTimeParam.split(':').map(Number);
      if (ch >= 0 && ch <= 23 && cm >= 0 && cm <= 59) {
        currentHours = ch;
        currentMinutes = cm;
      }
    }

    // Default or fallback to authoritative Asia/Tashkent time
    const now = new Date();
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tashkent',
        hourCycle: 'h23',
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'short',
      });
      const parts = formatter.formatToParts(now);
      let tashkentHour = -1;
      let tashkentMinute = -1;
      let weekdayShort = 'Mon';

      for (const p of parts) {
        if (p.type === 'hour') tashkentHour = parseInt(p.value, 10);
        if (p.type === 'minute') tashkentMinute = parseInt(p.value, 10);
        if (p.type === 'weekday') weekdayShort = p.value;
      }

      const weekdayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
      };
      dayOfWeek = weekdayMap[weekdayShort] ?? 1;

      // If clientTime wasn't given, use Tashkent time
      if (!clientTimeParam) {
        currentHours = tashkentHour >= 0 ? tashkentHour : (now.getUTCHours() + 5) % 24;
        currentMinutes = tashkentMinute >= 0 ? tashkentMinute : now.getUTCMinutes();
      }
    } catch {
      // Fallback: UTC+5 manual offset
      const utcHours = now.getUTCHours();
      currentHours = (utcHours + 5) % 24;
      currentMinutes = now.getUTCMinutes();
      dayOfWeek = now.getUTCDay();
    }

    const dayMap: Record<number, WeekDay> = {
      1: 'Du',
      2: 'Se',
      3: 'Ch',
      4: 'Pa',
      5: 'Ju',
      6: 'Sh',
    };

    const isSunday = dayOfWeek === 0;
    const currentDay: WeekDay = isSunday ? 'Du' : dayMap[dayOfWeek] || 'Du';

    const dayLessons = schedules
      .filter((s) => s.day === currentDay)
      .sort((a, b) => a.period - b.period);

    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    let currentLesson: ScheduleItem | null = null;
    let nextLesson: ScheduleItem | null = null;
    let isBreak = false;
    let breakLabel = '';
    let breakRemainingMinutes = 0;

    const lessonsWithStatus = dayLessons.map((item) => {
      const [startH, startM] = item.startTime.split(':').map(Number);
      const [endH, endM] = item.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      let status: 'past' | 'current' | 'upcoming' = 'upcoming';

      if (isSunday) {
        status = 'upcoming';
      } else if (currentTotalMinutes > endMinutes) {
        status = 'past';
      } else if (currentTotalMinutes >= startMinutes && currentTotalMinutes <= endMinutes) {
        status = 'current';
        currentLesson = item;
      } else {
        status = 'upcoming';
      }

      return {
        ...item,
        status,
      };
    });

    // Determine current and next lesson
    const currentItem = dayLessons.find((l) => {
      const [startH, startM] = l.startTime.split(':').map(Number);
      const [endH, endM] = l.endTime.split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      return currentTotalMinutes >= startMin && currentTotalMinutes <= endMin;
    });
    if (currentItem && !isSunday) {
      currentLesson = currentItem;
    }

    const upcomingItem = !isSunday ? dayLessons.find((l) => {
      const [startH, startM] = l.startTime.split(':').map(Number);
      const startMin = startH * 60 + startM;
      return currentTotalMinutes < startMin;
    }) : undefined;
    if (upcomingItem) {
      nextLesson = upcomingItem;
    }

    // Detect break between lessons
    if (!isSunday && !currentLesson && dayLessons.length > 0) {
      const firstLesson = dayLessons[0];
      const lastLesson = dayLessons[dayLessons.length - 1];
      const [firstH, firstM] = firstLesson.startTime.split(':').map(Number);
      const [lastH, lastM] = lastLesson.endTime.split(':').map(Number);
      const dayStartMinutes = firstH * 60 + firstM;
      const dayEndMinutes = lastH * 60 + lastM;

      if (currentTotalMinutes >= dayStartMinutes && currentTotalMinutes <= dayEndMinutes) {
        // We are within school hours but not in a lesson => In a break!
        isBreak = true;
        // Check if just finished 3rd period => Katta tanaffus (10 daqiqa)
        const period3 = dayLessons.find((l) => l.period === 3);
        const period4 = dayLessons.find((l) => l.period === 4);
        if (period3 && period4) {
          const [p3EndH, p3EndM] = period3.endTime.split(':').map(Number);
          const [p4StartH, p4StartM] = period4.startTime.split(':').map(Number);
          const p3End = p3EndH * 60 + p3EndM;
          const p4Start = p4StartH * 60 + p4StartM;
          if (currentTotalMinutes >= p3End && currentTotalMinutes < p4Start) {
            breakLabel = 'Katta tanaffus (10 daqiqa)';
            breakRemainingMinutes = Math.max(0, p4Start - currentTotalMinutes);
          }
        }
        if (!breakLabel && upcomingItem) {
          const [nextH, nextM] = upcomingItem.startTime.split(':').map(Number);
          breakLabel = 'Tanaffus (5 daqiqa)';
          breakRemainingMinutes = Math.max(0, (nextH * 60 + nextM) - currentTotalMinutes);
        }
      }
    }

    const dayNameMap: Record<WeekDay, string> = {
      Du: 'Dushanba',
      Se: 'Seshanba',
      Ch: 'Chorshanba',
      Pa: 'Payshanba',
      Ju: 'Juma',
      Sh: 'Shanba',
    };

    const currentTimeFormatted = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

    res.json({
      className,
      currentDay,
      dayName: dayNameMap[currentDay],
      isSunday,
      isWeekendNotice: isSunday ? 'Bugun yakshanba — dam olish kuni. Dushanba kungi darslar ko\'rsatilmoqda.' : null,
      currentTime: currentTimeFormatted,
      currentLesson,
      nextLesson,
      isBreak,
      breakLabel,
      breakRemainingMinutes,
      lessons: lessonsWithStatus,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Bugungi darslarni yuklashda xatolik.' });
  }
});

// GET /api/schedule/template - Download real sample Excel
router.get('/template', (_req: Request, res: Response) => {
  try {
    const buffer = generateSampleExcelBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename="43-maktab_dars_jadval_namuna.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Namunaviy faylni yaratishda xatolik.' });
  }
});

// POST /api/schedule/parse-excel - Preview uploaded Excel (Admin only)
router.post('/parse-excel', requireAdmin, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Excel fayl tanlanmadi.' });
    }

    const preview = parseScheduleExcel(req.file.buffer);
    res.json({
      success: true,
      fileName: req.file.originalname,
      preview,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Excel faylni o\'qishda xatolik yuz berdi.' });
  }
});

// POST /api/schedule/confirm-import - Save parsed schedule to database (Admin only)
router.post('/confirm-import', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, replaceMode, title, academicYear, term, fileName } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Import qilinadigan darslar topilmadi.' });
    }

    const versionId = `sch-v-${Date.now()}`;
    const newVersion: ScheduleVersion = {
      id: versionId,
      title: title || `${academicYear || '2026-2027'} o'quv yili yangi dars jadvali`,
      academicYear: academicYear || '2026-2027',
      term: term || 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      uploadedBy: req.user?.username || 'Admin',
      fileName: fileName || 'import.xlsx',
    };

    const scheduleEntities: ScheduleItem[] = items.map((it: any, idx: number) => ({
      id: `sch-${versionId}-${idx}`,
      classId: it.classId || `cls-${it.className}`,
      className: it.className,
      day: it.day,
      period: it.period,
      startTime: it.startTime,
      endTime: it.endTime,
      subject: it.subject,
      teacherName: it.teacherName || '',
      room: it.room || '',
      scheduleVersionId: versionId,
    }));

    if (replaceMode === 'replace') {
      dbService.replaceAllActiveSchedules(scheduleEntities, newVersion);
      dbService.logActivity(
        req.user?.username || 'Admin',
        'SCHEDULE_REPLACE',
        `Mavjud dars jadvali to'liq almashtirildi (${items.length} ta dars)`
      );
    } else {
      // Archive mode
      dbService.bulkInsertSchedules(scheduleEntities, newVersion, true);
      dbService.logActivity(
        req.user?.username || 'Admin',
        'SCHEDULE_IMPORT',
        `Yangi dars jadvali yuklandi va faollashtirildi (${items.length} ta dars, eski jadval arxivlandi)`
      );
    }

    res.json({
      success: true,
      message: 'Dars jadvali muvaffaqiyatli saqlandi va faollashtirildi.',
      version: newVersion,
      importedCount: scheduleEntities.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Jadvalni saqlashda xatolik yuz berdi.' });
  }
});

// GET /api/schedule/versions - List schedule versions
router.get('/versions', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const versions = dbService.getScheduleVersions();
    res.json(versions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Jadval versiyalarini olishda xatolik.' });
  }
});

// POST /api/schedule/versions/:id/activate - Activate an archived version
router.post('/versions/:id/activate', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = dbService.setActiveScheduleVersion(id);
    if (!ok) {
      return res.status(404).json({ error: 'Jadval versiyasi topilmadi.' });
    }
    dbService.logActivity(req.user?.username || 'Admin', 'SCHEDULE_ACTIVATE', `Jadval versiyasi faollashtirildi: ${id}`);
    res.json({ success: true, message: 'Jadval faollashtirildi.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Xatolik.' });
  }
});

// POST /api/schedule/lesson - Manual add single lesson (Admin only)
router.post('/lesson', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { className, day, period, subject, teacherName, room } = req.body;
    if (!className || !day || !period || !subject) {
      return res.status(400).json({ error: 'Sinf, kun, dars raqami va fan nomi kiritilishi shart.' });
    }

    const activeVersion = dbService.getActiveScheduleVersion();
    if (!activeVersion) {
      return res.status(400).json({ error: 'Faol jadval versiyasi mavjud emas.' });
    }

    const timeInfo = LESSON_TIMES[period - 1] || { startTime: '08:00', endTime: '08:45' };

    const newItem = dbService.createScheduleItem({
      id: `sch-manual-${Date.now()}`,
      classId: `cls-${className}`,
      className,
      day,
      period,
      startTime: timeInfo.startTime,
      endTime: timeInfo.endTime,
      subject,
      teacherName: teacherName || '',
      room: room || '',
      scheduleVersionId: activeVersion.id,
    });

    dbService.logActivity(req.user?.username || 'Admin', 'LESSON_CREATE', `${className} - ${day} ${period}-dars qo'shildi (${subject})`);

    res.json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Darsni qo\'shishda xatolik.' });
  }
});

// PUT /api/schedule/lesson/:id - Manual edit single lesson (Admin only)
router.put('/lesson/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = dbService.updateScheduleItem(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Dars topilmadi.' });
    }

    dbService.logActivity(req.user?.username || 'Admin', 'LESSON_UPDATE', `Dars tahrirlandi: ${id}`);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Darsni yangilashda xatolik.' });
  }
});

// DELETE /api/schedule/lesson/:id - Manual delete single lesson (Admin only)
router.delete('/lesson/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = dbService.deleteScheduleItem(id);
    if (!ok) {
      return res.status(404).json({ error: 'Dars topilmadi.' });
    }

    dbService.logActivity(req.user?.username || 'Admin', 'LESSON_DELETE', `Dars o'chirildi: ${id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Darsni o\'chirishda xatolik.' });
  }
});

export default router;
