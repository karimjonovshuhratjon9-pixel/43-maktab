import { SchoolScheduleConfig } from '../utils/scheduleCalculator.ts';

export type UserRole = 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  createdAt: string;
}

export interface SchoolInfo {
  name: string;
  fullName: string;
  address: string;
  creator: string;
  phone?: string;
  email?: string;
  telegramChannel?: string;
  scheduleConfig: SchoolScheduleConfig;
}

export interface LeadershipPerson {
  id: string;
  role: string;
  fullName: string;
  bio?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  subject: string;
  roleTitle?: string;
  experienceYears?: number;
  bio?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  isFeatured?: boolean;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. '1A', '1B', '1D', ..., '8A', ..., '11A'
  grade: number;
  shift?: number;
  room?: string;
  classTeacher?: string;
}

export type WeekDay = 'Du' | 'Se' | 'Ch' | 'Pa' | 'Ju' | 'Sh';

export interface ScheduleItem {
  id: string;
  classId: string;
  className: string;
  day: WeekDay;
  period: number; // 1 to 6
  startTime: string;
  endTime: string;
  subject: string;
  teacherName?: string;
  room?: string;
  scheduleVersionId: string;
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
  summary?: string;
  content: string;
  coverImage?: string;
  category?: string;
  author?: string;
  isPublished: boolean;
  views?: number;
  publishedAt: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category?: string;
  targetAudience?: 'all' | 'students' | 'parents' | 'teachers';
  isPinned: boolean;
  isActive: boolean;
  expiryDate?: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
  description?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminActivityLog {
  id: string;
  adminUsername: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SchoolAchievement {
  id: string;
  fullName: string;
  studentName?: string; // backwards compatibility
  title: string; // musobaqa / yutuq nomi
  contest?: string; // backwards compatibility
  place: string; // Masalan: "1-o'rin (Oltin medal)"
  year: number;
  className?: string; // Masalan: "9A" yoki "Bitiruvchi"
  category?: string; // Masalan: "Fan olimpiadasi", "Sport", "San'at"
  imageUrl: string;
  achievementDetails: string; // batafsil yutuq tavsifi
  description?: string; // backwards compatibility
  isVisible: boolean; // asosiy sahifada ko'rsatish
  order: number; // ko'rinish tartibi
  createdAt: string;
}

export interface SchoolVideo {
  id: string;
  title: string;
  description: string;
  videoType: 'upload' | 'instagram';
  videoUrl: string; // uploaded file path or Instagram link
  thumbnailUrl?: string; // muqova rasmi
  instagramUrl?: string; // Instagram link
  duration?: string;
  isVisible: boolean;
  order: number;
  createdAt: string;
}

export interface DatabaseSchema {
  school: SchoolInfo;
  leadership: LeadershipPerson[];
  users: User[];
  teachers: Teacher[];
  classes: SchoolClass[];
  schedules: ScheduleItem[];
  scheduleVersions: ScheduleVersion[];
  news: NewsArticle[];
  announcements: Announcement[];
  gallery: GalleryItem[];
  achievements: SchoolAchievement[];
  videos: SchoolVideo[];
  messages: ContactMessage[];
  activityLogs: AdminActivityLog[];
}
