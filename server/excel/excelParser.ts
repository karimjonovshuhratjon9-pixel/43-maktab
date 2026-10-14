import * as XLSX from 'xlsx';
import { ScheduleItem, WeekDay } from '../db/types.ts';
import { LESSON_TIMES, CLASS_NAMES } from '../db/seedData.ts';

export interface ParsedSchedulePreview {
  totalRows: number;
  detectedClasses: string[];
  detectedDays: string[];
  detectedPeriods: number[];
  validLessonsCount: number;
  sampleItems: {
    className: string;
    day: string;
    period: number;
    time: string;
    subject: string;
  }[];
  parsedItems: Omit<ScheduleItem, 'id' | 'scheduleVersionId'>[];
}

const DAY_MAP: Record<string, WeekDay> = {
  du: 'Du',
  dushanba: 'Du',
  se: 'Se',
  seshanba: 'Se',
  ch: 'Ch',
  chorshanba: 'Ch',
  pa: 'Pa',
  payshanba: 'Pa',
  ju: 'Ju',
  juma: 'Ju',
  sh: 'Sh',
  shanba: 'Sh',
};

export function parseScheduleExcel(buffer: Buffer): ParsedSchedulePreview {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer' });
  } catch {
    throw new Error('Excel fayl formati noto\'g\'ri yoki fayl shikastlangan.');
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Excel faylida hech qanday sahifa (worksheet) topilmadi.');
  }

  const sheet = workbook.Sheets[sheetName];
  const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rawData.length < 2) {
    throw new Error('Excel faylida yetarli ma\'lumot yo\'q.');
  }

  // Find header row containing class names
  let headerRowIndex = -1;
  let classColIndices: { colIndex: number; className: string }[] = [];

  for (let r = 0; r < Math.min(10, rawData.length); r++) {
    const row = rawData[r];
    const detected: { colIndex: number; className: string }[] = [];

    row.forEach((cellVal: any, colIdx: number) => {
      const str = String(cellVal || '').trim().toUpperCase();
      // Match 1A, 1B, 1D, 1-A, 8A, 11A, etc.
      const match = str.match(/^([1-9]|1[0-1])\s*[-_]?\s*([A-ZА-ЯЁD])$/);
      if (match) {
        const normalized = `${match[1]}${match[2]}`;
        detected.push({ colIndex: colIdx, className: normalized });
      }
    });

    if (detected.length >= 3) {
      headerRowIndex = r;
      classColIndices = detected;
      break;
    }
  }

  // Fallback if class header wasn't strictly formatted: check for any column with classes
  if (headerRowIndex === -1 || classColIndices.length === 0) {
    // try to find by searching default class names
    for (let r = 0; r < Math.min(10, rawData.length); r++) {
      const row = rawData[r];
      const detected: { colIndex: number; className: string }[] = [];
      row.forEach((cellVal: any, colIdx: number) => {
        const str = String(cellVal || '').trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
        if (CLASS_NAMES.includes(str)) {
          detected.push({ colIndex: colIdx, className: str });
        }
      });
      if (detected.length >= 2) {
        headerRowIndex = r;
        classColIndices = detected;
        break;
      }
    }
  }

  if (headerRowIndex === -1 || classColIndices.length === 0) {
    throw new Error('Excel faylida sinf ustunlari (masalan: 1A, 1B, 8A, 11A) aniqlanmadi.');
  }

  // Identify Day column, Period column, Time column
  let dayColIndex = -1;
  let periodColIndex = -1;
  let timeColIndex = -1;

  // Inspect first non-class columns
  for (let col = 0; col < classColIndices[0].colIndex; col++) {
    // Check cell contents in rows below header
    for (let r = headerRowIndex + 1; r < Math.min(headerRowIndex + 15, rawData.length); r++) {
      const val = String(rawData[r][col] || '').trim().toLowerCase();
      if (DAY_MAP[val] || val.includes('dush') || val.includes('sesh') || val === 'du' || val === 'se') {
        dayColIndex = col;
        break;
      }
    }
  }

  if (dayColIndex === -1) {
    dayColIndex = 0; // standard default
  }

  // Look for period or time column
  for (let col = 0; col < classColIndices[0].colIndex; col++) {
    if (col === dayColIndex) continue;
    const testVal = String(rawData[headerRowIndex + 1]?.[col] || '').trim();
    if (testVal.match(/^[1-6]$/)) {
      periodColIndex = col;
    } else if (testVal.includes(':') || testVal.includes('08:00')) {
      timeColIndex = col;
    }
  }

  if (periodColIndex === -1) {
    periodColIndex = dayColIndex + 1 < classColIndices[0].colIndex ? dayColIndex + 1 : -1;
  }

  const parsedItems: Omit<ScheduleItem, 'id' | 'scheduleVersionId'>[] = [];
  const daysFound = new Set<string>();
  const periodsFound = new Set<number>();

  let currentDay: WeekDay = 'Du';
  let defaultPeriodCounter = 1;

  for (let r = headerRowIndex + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!row || row.length === 0) continue;

    // Check if day changed
    const rawDayCell = dayColIndex >= 0 ? String(row[dayColIndex] || '').trim().toLowerCase() : '';
    if (rawDayCell) {
      const cleanDay = rawDayCell.replace(/[^a-zа-я]/gi, '').toLowerCase();
      if (DAY_MAP[cleanDay]) {
        currentDay = DAY_MAP[cleanDay];
        defaultPeriodCounter = 1;
      } else if (cleanDay.startsWith('du')) currentDay = 'Du';
      else if (cleanDay.startsWith('se')) currentDay = 'Se';
      else if (cleanDay.startsWith('ch')) currentDay = 'Ch';
      else if (cleanDay.startsWith('pa')) currentDay = 'Pa';
      else if (cleanDay.startsWith('ju')) currentDay = 'Ju';
      else if (cleanDay.startsWith('sh')) currentDay = 'Sh';
    }

    daysFound.add(currentDay);

    // Period check
    let period = defaultPeriodCounter;
    if (periodColIndex >= 0) {
      const rawPeriod = parseInt(String(row[periodColIndex] || '').replace(/[^0-9]/g, ''), 10);
      if (!isNaN(rawPeriod) && rawPeriod >= 1 && rawPeriod <= 8) {
        period = rawPeriod;
      }
    }

    if (period > 6) period = 6;
    periodsFound.add(period);

    // Time
    const periodTimeInfo = LESSON_TIMES[period - 1] || { startTime: '08:00', endTime: '08:45' };
    let startTime = periodTimeInfo.startTime;
    let endTime = periodTimeInfo.endTime;

    if (timeColIndex >= 0) {
      const rawTime = String(row[timeColIndex] || '').trim();
      const parts = rawTime.split(/[-–—]/);
      if (parts.length === 2 && parts[0].includes(':')) {
        startTime = parts[0].trim();
        endTime = parts[1].trim();
      }
    }

    // Extract subjects for each class column
    classColIndices.forEach(({ colIndex, className }) => {
      const rawSubject = String(row[colIndex] || '').trim();
      if (rawSubject && rawSubject !== '-' && rawSubject !== '—') {
        parsedItems.push({
          classId: `cls-${className}`,
          className,
          day: currentDay,
          period,
          startTime,
          endTime,
          subject: rawSubject,
        });
      }
    });

    defaultPeriodCounter = (defaultPeriodCounter % 6) + 1;
  }

  const detectedClasses = Array.from(new Set(classColIndices.map((c) => c.className)));
  const detectedDays = Array.from(daysFound);
  const detectedPeriods = Array.from(periodsFound).sort((a, b) => a - b);

  return {
    totalRows: rawData.length - headerRowIndex - 1,
    detectedClasses,
    detectedDays,
    detectedPeriods,
    validLessonsCount: parsedItems.length,
    sampleItems: parsedItems.slice(0, 10).map((it) => ({
      className: it.className,
      day: it.day,
      period: it.period,
      time: `${it.startTime}–${it.endTime}`,
      subject: it.subject,
    })),
    parsedItems,
  };
}

export function generateSampleExcelBuffer(): Buffer {
  const wb = XLSX.utils.book_new();

  // Create header row
  const header = ['Kun', 'Dars', 'Vaqt', ...CLASS_NAMES];
  const rows: any[][] = [header];

  const DAYS_LIST: WeekDay[] = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
  const SAMPLE_SUBJECTS = [
    'Matematika', 'Ona tili', 'Adabiyot', 'Ingliz tili', 'Fizika', 
    'Kimyo', 'Biologiya', 'Tarix', 'Informatika', 'Jismoniy tarbiya'
  ];

  DAYS_LIST.forEach((day: WeekDay, dIdx: number) => {
    LESSON_TIMES.forEach((timeInfo: { period: number; startTime: string; endTime: string }) => {
      const row: any[] = [
        timeInfo.period === 1 ? day : '', // Show day name once per day block
        timeInfo.period,
        `${timeInfo.startTime}–${timeInfo.endTime}`,
      ];

      // Add subject for each class
      CLASS_NAMES.forEach((_clsName: string, cIdx: number) => {
        const subIndex = (dIdx * 3 + timeInfo.period + cIdx) % SAMPLE_SUBJECTS.length;
        row.push(SAMPLE_SUBJECTS[subIndex]);
      });

      rows.push(row);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },  // Kun
    { wch: 6 },  // Dars
    { wch: 14 }, // Vaqt
    ...CLASS_NAMES.map(() => ({ wch: 16 })),
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Dars Jadvali');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
