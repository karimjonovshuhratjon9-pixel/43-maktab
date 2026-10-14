import bcrypt from 'bcryptjs';
import { DatabaseSchema, WeekDay, ScheduleItem, SchoolClass } from './types.ts';
import { DEFAULT_SCHEDULE_CONFIG, calculateSchedulePeriods } from '../utils/scheduleCalculator.ts';

export const DAYS: WeekDay[] = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

export const CLASS_NAMES = [
  '1A', '1B', '1D',
  '2A', '2B', '2D',
  '3A', '3B',
  '4A', '4B',
  '5A', '5B',
  '6A', '6B',
  '7A', '7B',
  '8A', '8B',
  '9A', '9B',
  '10A', '10B',
  '11A'
];

export const INITIAL_CLASSES: SchoolClass[] = CLASS_NAMES.map((name) => {
  const gradeMatch = name.match(/^(\d+)/);
  const grade = gradeMatch ? parseInt(gradeMatch[1], 10) : 1;
  return {
    id: `cls-${name.toLowerCase()}`,
    name,
    grade,
    shift: grade <= 4 ? 1 : 1,
  };
});

export const LESSON_TIMES = [
  { period: 1, startTime: '08:00', endTime: '08:45' },
  { period: 2, startTime: '08:50', endTime: '09:35' },
  { period: 3, startTime: '09:40', endTime: '10:25' },
  { period: 4, startTime: '10:35', endTime: '11:20' },
  { period: 5, startTime: '11:25', endTime: '12:10' },
  { period: 6, startTime: '12:15', endTime: '13:00' },
  { period: 7, startTime: '13:05', endTime: '13:50' },
];

export async function generateSeedData(): Promise<DatabaseSchema> {
  const adminUsername = process.env.ADMIN_USERNAME || 'ShuhratjonDEV';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin2011';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const school = {
    name: '43-maktab',
    fullName: 'Farg‘ona viloyati 43-umumiy o‘rta ta’lim maktabi',
    address: '88GG+522, Katput qishlog‘i, Farg‘ona viloyati, O‘zbekiston',
    creator: 'Karimjonov Shuhratjon',
    telegramChannel: 'https://t.me/oltiariq_43_maktab',
    scheduleConfig: { ...DEFAULT_SCHEDULE_CONFIG },
  };

  const leadership = [
    {
      id: 'ldr-1',
      role: 'Maktab direktori',
      fullName: 'Sheraliyev Axrorbek',
      bio: '43-umumiy o‘rta ta’lim maktabi direktori',
    },
    {
      id: 'ldr-2',
      role: 'Direktor o‘rinbosari',
      fullName: 'Boymatov To‘lqinjon',
      bio: 'O‘quv-tarbiyaviy ishlar bo‘yicha direktor o‘rinbosari',
    },
    {
      id: 'ldr-3',
      role: 'Maktab psixologi',
      fullName: 'Abdullayev Anvarjon',
      bio: '43-umumiy o‘rta ta’lim maktabi amaliyotchi psixologi',
    },
  ];

  const users = [
    {
      id: 'usr-admin-1',
      username: adminUsername,
      passwordHash: adminPasswordHash,
      role: 'ADMIN' as const,
      fullName: 'Karimjonov Shuhratjon',
      createdAt: new Date().toISOString(),
    },
  ];

  const activeVersionId = 'sch-v-asosiy';
  const scheduleVersions = [
    {
      id: activeVersionId,
      title: '2026-2027 o‘quv yili asosiy dars jadvali',
      academicYear: '2026-2027',
      term: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      uploadedBy: 'ShuhratjonDEV',
    },
  ];

  const calculatedPeriods = calculateSchedulePeriods(school.scheduleConfig);

  const primarySubjects = ['Ona tili', 'Matematika', 'O‘qish', 'Tabiiy fan', 'Tasviriy san’at', 'Jismoniy tarbiya'];
  const middleSubjects = ['Matematika', 'Ona tili', 'Adabiyot', 'Ingliz tili', 'Tarix', 'Informatika', 'Botanika'];
  const seniorSubjects = ['Algebra', 'Geometriya', 'Fizika', 'Kimyo', 'Biologiya', 'Ona tili', 'Ingliz tili', 'Tarix'];

  const schedules: ScheduleItem[] = [];

  INITIAL_CLASSES.forEach((cls) => {
    let subjects = primarySubjects;
    if (cls.grade >= 5 && cls.grade <= 7) subjects = middleSubjects;
    if (cls.grade >= 8) subjects = seniorSubjects;

    const lessonsPerDay = cls.grade <= 4 ? 4 : cls.grade <= 8 ? 5 : 6;

    DAYS.forEach((day, dIdx) => {
      for (let pNum = 1; pNum <= lessonsPerDay; pNum++) {
        const pInfo = calculatedPeriods[pNum - 1];
        if (!pInfo) continue;
        const sub = subjects[(dIdx * 2 + pNum) % subjects.length];

        schedules.push({
          id: `sch-${cls.name}-${day}-${pNum}`,
          classId: cls.id,
          className: cls.name,
          day,
          period: pNum,
          startTime: pInfo.startTime,
          endTime: pInfo.endTime,
          subject: sub,
          scheduleVersionId: activeVersionId,
        });
      }
    });
  });

  const announcements = [
    {
      id: 'ann-1',
      title: '43-maktab rasmiy web-platformasi ishga tushirildi',
      content: 'Hurmatli o‘quvchilar, ota-onalar va ustozlar! 43-umumiy o‘rta ta’lim maktabining rasmiy elektron portali faoliyatini boshladi. Ushbu platforma orqali dars jadvali, qo‘ng‘iroqlar vaqti, rasmiy e’lonlar va maktab yangiliklarini kuzatib borishingiz mumkin.',
      category: 'Rasmiy e’lon',
      isPinned: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    school,
    leadership,
    users,
    teachers: [], // Empty state: Admin adds real verified teachers
    classes: INITIAL_CLASSES,
    schedules,
    scheduleVersions,
    news: [], // Empty state: Admin adds real news
    announcements,
    gallery: [], // Empty state: Admin adds real photos
    achievements: [], // Maktabimiz faxrlari: Admin adds real verified achievements
    videos: [], // Maktabimiz videolari: Admin adds real uploaded/instagram videos
    messages: [],
    activityLogs: [
      {
        id: `act-${Date.now()}`,
        adminUsername: 'ShuhratjonDEV',
        action: 'INIT',
        details: '43-maktab platformasi tasdiqlangan ma’lumotlar bilan ishga tushirildi',
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
