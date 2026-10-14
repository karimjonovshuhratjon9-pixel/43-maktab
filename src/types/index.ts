export type UserRole = 'ADMIN' | 'STUDENT';

export interface SchoolInfo {
  name: string;
  fullName: string;
  address: string;
  creator: string;
  phone?: string;
  email?: string;
  telegramChannel?: string;
  scheduleConfig?: {
    firstLessonStartTime: string;
    lessonDurationMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
    totalPeriods: number;
  };
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  className: string;
  fullName: string;
  parentPhone?: string;
  address?: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  subject: string;
  roleTitle: string;
  experienceYears: number;
  bio: string;
  imageUrl: string;
  phone?: string;
  email?: string;
  isFeatured?: boolean;
}

export interface SchoolClass {
  id: string;
  name: string;
  grade: number;
  letter: string;
  shift: number;
  room?: string;
  classTeacher?: string;
}

export type WeekDay = 'Du' | 'Se' | 'Ch' | 'Pa' | 'Ju' | 'Sh';

export interface ScheduleItem {
  id: string;
  classId: string;
  className: string;
  day: WeekDay;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName?: string;
  room?: string;
  scheduleVersionId: string;
  status?: 'past' | 'current' | 'upcoming';
}

export interface ScheduleVersion {
  id: string;
  title: string;
  academicYear: string;
  term: number;
  isActive: boolean;
  createdAt: string;
  uploadedBy?: string;
  fileName?: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  isPublished: boolean;
  views: number;
  publishedAt: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isActive: boolean;
  targetAudience: 'all' | 'students' | 'parents' | 'teachers';
  expiryDate?: string;
  createdAt: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  studentName: string;
  fullName?: string;
  className: string;
  contest: string;
  title?: string;
  place: string;
  year: number;
  imageUrl: string;
  description: string;
  achievementDetails?: string;
  category?: string;
  isVisible?: boolean;
  order?: number;
  createdAt: string;
}

export type SchoolAchievement = Achievement;

export interface SchoolVideo {
  id: string;
  title: string;
  description: string;
  videoType: 'upload' | 'instagram';
  videoUrl: string;
  thumbnailUrl?: string;
  instagramUrl?: string;
  duration?: string;
  isVisible: boolean;
  order: number;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Maktab' | 'Tadbirlar' | 'Sport' | 'Olimpiadalar' | 'O\'quv jarayoni';
  imageUrl: string;
  description?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalStudents?: number;
  totalTeachers: number;
  totalClasses: number;
  activeScheduleVersion: string;
  totalNews: number;
  totalAnnouncements: number;
  totalGallery?: number;
  totalEvents?: number;
  totalAchievements?: number;
  totalVideos?: number;
  unreadMessages: number;
  totalMessages: number;
}

export interface ActivityLog {
  id: string;
  adminUsername: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ExcelPreview {
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
