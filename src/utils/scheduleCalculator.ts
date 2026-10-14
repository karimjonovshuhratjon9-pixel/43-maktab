export interface SchoolScheduleConfig {
  firstLessonStartTime: string; // e.g. "08:00"
  lessonDurationMinutes: number; // 45
  shortBreakMinutes: number; // 5
  longBreakMinutes: number; // 10
  longBreakInterval: number; // 3
  totalPeriods: number; // 7
}

export const DEFAULT_SCHEDULE_CONFIG: SchoolScheduleConfig = {
  firstLessonStartTime: '08:00',
  lessonDurationMinutes: 45,
  shortBreakMinutes: 5,
  longBreakMinutes: 10,
  longBreakInterval: 3,
  totalPeriods: 7,
};

export interface BreakInfo {
  type: 'short' | 'long';
  durationMinutes: number;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
}

export interface CalculatedPeriod {
  period: number;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  breakAfter?: BreakInfo;
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 480;
  const [h, m] = timeStr.split(':').map((s) => parseInt(s.trim(), 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, totalMinutes % 1440);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calculateSchedulePeriods(config: SchoolScheduleConfig = DEFAULT_SCHEDULE_CONFIG): CalculatedPeriod[] {
  const result: CalculatedPeriod[] = [];
  let currentMinutes = parseTimeToMinutes(config.firstLessonStartTime || '08:00');

  for (let period = 1; period <= (config.totalPeriods || 7); period++) {
    const startMinutes = currentMinutes;
    const endMinutes = startMinutes + (config.lessonDurationMinutes || 45);
    const isLongBreak = period % (config.longBreakInterval || 3) === 0;
    const breakDuration = isLongBreak ? (config.longBreakMinutes || 10) : (config.shortBreakMinutes || 5);

    const breakStart = endMinutes;
    const breakEnd = breakStart + breakDuration;

    const periodObj: CalculatedPeriod = {
      period,
      startTime: formatMinutesToTime(startMinutes),
      endTime: formatMinutesToTime(endMinutes),
      startMinutes,
      endMinutes,
    };

    if (period < (config.totalPeriods || 7)) {
      periodObj.breakAfter = {
        type: isLongBreak ? 'long' : 'short',
        durationMinutes: breakDuration,
        startTime: formatMinutesToTime(breakStart),
        endTime: formatMinutesToTime(breakEnd),
        startMinutes: breakStart,
        endMinutes: breakEnd,
      };
      currentMinutes = breakEnd;
    } else {
      currentMinutes = endMinutes;
    }

    result.push(periodObj);
  }

  return result;
}

export interface LiveScheduleStatus {
  currentTimeFormatted: string; // HH:MM:SS
  currentDateFormatted: string; // DD.MM.YYYY
  state: 'lesson' | 'short_break' | 'long_break' | 'before_school' | 'after_school';
  stateLabel: string;
  activePeriodNumber: number | null;
  nextPeriodNumber: number | null;
  lessonProgressPercent: number;
  remainingSeconds: number;
  remainingFormatted: string; // MM:SS
}

export function evaluateLiveSchedule(
  periods: CalculatedPeriod[],
  now: Date = new Date()
): LiveScheduleStatus {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const currentTotalSeconds = (hours * 60 + minutes) * 60 + seconds;
  const currentMinutes = hours * 60 + minutes;

  const pad = (n: number) => String(n).padStart(2, '0');
  const currentTimeFormatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  const currentDateFormatted = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;

  if (!periods || periods.length === 0) {
    return {
      currentTimeFormatted,
      currentDateFormatted,
      state: 'before_school',
      stateLabel: 'Jadval kiritilmagan',
      activePeriodNumber: null,
      nextPeriodNumber: null,
      lessonProgressPercent: 0,
      remainingSeconds: 0,
      remainingFormatted: '00:00',
    };
  }

  const firstPeriod = periods[0];
  const lastPeriod = periods[periods.length - 1];

  // Before school
  if (currentMinutes < firstPeriod.startMinutes) {
    const diffSeconds = firstPeriod.startMinutes * 60 - currentTotalSeconds;
    return {
      currentTimeFormatted,
      currentDateFormatted,
      state: 'before_school',
      stateLabel: 'Darslar boshlanishiga qoldi',
      activePeriodNumber: null,
      nextPeriodNumber: firstPeriod.period,
      lessonProgressPercent: 0,
      remainingSeconds: Math.max(0, diffSeconds),
      remainingFormatted: formatSeconds(diffSeconds),
    };
  }

  // After school
  if (currentMinutes >= lastPeriod.endMinutes) {
    return {
      currentTimeFormatted,
      currentDateFormatted,
      state: 'after_school',
      stateLabel: 'Bugungi darslar yakunlangan',
      activePeriodNumber: null,
      nextPeriodNumber: null,
      lessonProgressPercent: 100,
      remainingSeconds: 0,
      remainingFormatted: '00:00',
    };
  }

  // Check each period and its break
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i];

    // Inside lesson
    if (currentMinutes >= p.startMinutes && currentMinutes < p.endMinutes) {
      const lessonDurationSec = (p.endMinutes - p.startMinutes) * 60;
      const elapsedSec = currentTotalSeconds - p.startMinutes * 60;
      const remainingSec = Math.max(0, lessonDurationSec - elapsedSec);
      const progressPercent = Math.min(100, Math.max(0, Math.floor((elapsedSec / lessonDurationSec) * 100)));

      return {
        currentTimeFormatted,
        currentDateFormatted,
        state: 'lesson',
        stateLabel: `HOZIR: ${p.period}-DARS`,
        activePeriodNumber: p.period,
        nextPeriodNumber: i + 1 < periods.length ? periods[i + 1].period : null,
        lessonProgressPercent: progressPercent,
        remainingSeconds: remainingSec,
        remainingFormatted: formatSeconds(remainingSec),
      };
    }

    // Inside break
    if (p.breakAfter && currentMinutes >= p.breakAfter.startMinutes && currentMinutes < p.breakAfter.endMinutes) {
      const breakDurationSec = p.breakAfter.durationMinutes * 60;
      const elapsedSec = currentTotalSeconds - p.breakAfter.startMinutes * 60;
      const remainingSec = Math.max(0, breakDurationSec - elapsedSec);
      const isLong = p.breakAfter.type === 'long';

      return {
        currentTimeFormatted,
        currentDateFormatted,
        state: isLong ? 'long_break' : 'short_break',
        stateLabel: isLong ? 'UZOQ TANAFFUS (10 DAQIQA)' : 'TANAFFUS (5 DAQIQA)',
        activePeriodNumber: null,
        nextPeriodNumber: p.period + 1,
        lessonProgressPercent: 0,
        remainingSeconds: remainingSec,
        remainingFormatted: formatSeconds(remainingSec),
      };
    }
  }

  return {
    currentTimeFormatted,
    currentDateFormatted,
    state: 'after_school',
    stateLabel: 'Darslar yakunlandi',
    activePeriodNumber: null,
    nextPeriodNumber: null,
    lessonProgressPercent: 100,
    remainingSeconds: 0,
    remainingFormatted: '00:00',
  };
}

function formatSeconds(totalSec: number): string {
  if (totalSec <= 0) return '00:00';
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
