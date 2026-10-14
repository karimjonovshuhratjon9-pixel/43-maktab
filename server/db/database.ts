import fs from 'fs';
import path from 'path';
import { 
  DatabaseSchema, 
  ScheduleItem, 
  ScheduleVersion, 
  Teacher, 
  NewsArticle, 
  Announcement, 
  GalleryItem, 
  ContactMessage, 
  SchoolClass, 
  AdminActivityLog, 
  User, 
  SchoolInfo, 
  LeadershipPerson,
  SchoolAchievement,
  SchoolVideo
} from './types.ts';
import { generateSeedData } from './seedData.ts';
import { calculateSchedulePeriods } from '../utils/scheduleCalculator.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'school_db.json');

class DatabaseService {
  private db: DatabaseSchema | null = null;
  private isInitialized = false;

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) {
      return;
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Validate if legacy or unverified data present (e.g. mentions of Toshkent, fake teachers, or missing school info)
        const hasUnverified = 
          !parsed.school || 
          !parsed.leadership || 
          parsed.school.address?.includes('Toshkent') ||
          (Array.isArray(parsed.teachers) && parsed.teachers.some((t: any) => t.fullName?.includes('Rahmonova') || t.phone?.includes('234'))) ||
          (Array.isArray(parsed.classes) && parsed.classes.length < 15);

        if (hasUnverified) {
          console.log('Unverified or legacy database detected. Reseeding with verified data...');
          await this.reseed();
        } else {
          this.db = parsed;
          if (this.db) {
            if (!Array.isArray(this.db.achievements)) this.db.achievements = [];
            if (!Array.isArray(this.db.videos)) this.db.videos = [];
            
            // Ensure longBreakMinutes is 10
            if (this.db.school?.scheduleConfig) {
              this.db.school.scheduleConfig.longBreakMinutes = 10;
            }

            // Ensure Abdullayev Anvarjon is present in leadership
            if (Array.isArray(this.db.leadership)) {
              const hasAnvarjon = this.db.leadership.some(
                (l) => l.fullName.toLowerCase().includes('anvarjon') || l.fullName.toLowerCase().includes('abdullayev')
              );
              if (!hasAnvarjon) {
                this.db.leadership.push({
                  id: 'ldr-3',
                  role: 'Maktab psixologi',
                  fullName: 'Abdullayev Anvarjon',
                  bio: '43-umumiy o‘rta ta’lim maktabi amaliyotchi psixologi',
                });
                this.save();
              }
            }
          }
          console.log('✓ Database loaded from disk successfully.');
        }
      } catch (err) {
        console.error('Failed to parse database file, reseeding:', err);
        await this.reseed();
      }
    } else {
      console.log('Database file not found. Generating fresh verified seed data...');
      await this.reseed();
    }

    this.isInitialized = true;
  }

  public async reseed(): Promise<void> {
    this.db = await generateSeedData();
    this.save();
    console.log('✓ Database initialized and saved with verified school data.');
  }

  private save(): void {
    if (!this.db) return;
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // --- School Info & Central Schedule Config ---
  public getSchoolInfo(): SchoolInfo {
    if (!this.db) throw new Error('DB not initialized');
    return this.db.school;
  }

  public updateSchoolInfo(updates: Partial<SchoolInfo>): SchoolInfo {
    if (!this.db) throw new Error('DB not initialized');
    this.db.school = {
      ...this.db.school,
      ...updates,
      scheduleConfig: {
        ...this.db.school.scheduleConfig,
        ...(updates.scheduleConfig || {}),
      },
    };

    // If scheduleConfig was updated, recalculate start/end times for all existing schedule items
    if (updates.scheduleConfig) {
      const calculatedPeriods = calculateSchedulePeriods(this.db.school.scheduleConfig);
      this.db.schedules = this.db.schedules.map((item) => {
        const p = calculatedPeriods.find((cp) => cp.period === item.period);
        if (p) {
          return {
            ...item,
            startTime: p.startTime,
            endTime: p.endTime,
          };
        }
        return item;
      });
    }

    this.save();
    return this.db.school;
  }

  // --- Leadership ---
  public getLeadership(): LeadershipPerson[] {
    return this.db?.leadership || [];
  }

  public updateLeadership(list: LeadershipPerson[]): LeadershipPerson[] {
    if (!this.db) throw new Error('DB not initialized');
    this.db.leadership = list;
    this.save();
    return this.db.leadership;
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.db?.users || [];
  }

  public findUserByUsername(username: string): User | undefined {
    return this.db?.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.db?.users.find((u) => u.id === id);
  }

  public createUser(user: User): User {
    if (!this.db) throw new Error('DB not initialized');
    this.db.users.push(user);
    this.save();
    return user;
  }

  public updateUserPassword(userId: string, newPasswordHash: string): boolean {
    if (!this.db) return false;
    const user = this.db.users.find((u) => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    this.save();
    return true;
  }

  // --- Classes ---
  public getClasses(): SchoolClass[] {
    return this.db?.classes || [];
  }

  public createClass(cls: SchoolClass): SchoolClass {
    if (!this.db) throw new Error('DB not initialized');
    this.db.classes.push(cls);
    this.save();
    return cls;
  }

  public updateClass(id: string, updates: Partial<SchoolClass>): SchoolClass | null {
    if (!this.db) return null;
    const idx = this.db.classes.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.db.classes[idx] = { ...this.db.classes[idx], ...updates };
    this.save();
    return this.db.classes[idx];
  }

  public deleteClass(id: string): boolean {
    if (!this.db) return false;
    const len = this.db.classes.length;
    this.db.classes = this.db.classes.filter((c) => c.id !== id);
    if (this.db.classes.length !== len) {
      this.db.schedules = this.db.schedules.filter((s) => s.classId !== id);
      this.save();
      return true;
    }
    return false;
  }

  // --- Schedules ---
  public getScheduleVersions(): ScheduleVersion[] {
    return this.db?.scheduleVersions || [];
  }

  public getActiveScheduleVersion(): ScheduleVersion | undefined {
    return this.db?.scheduleVersions.find((v) => v.isActive);
  }

  public createScheduleVersion(version: ScheduleVersion): ScheduleVersion {
    if (!this.db) throw new Error('DB not initialized');
    this.db.scheduleVersions.push(version);
    this.save();
    return version;
  }

  public setActiveScheduleVersion(versionId: string): boolean {
    if (!this.db) return false;
    this.db.scheduleVersions.forEach((v) => {
      v.isActive = v.id === versionId;
    });
    this.save();
    return true;
  }

  public getSchedules(className?: string, versionId?: string): ScheduleItem[] {
    if (!this.db) return [];
    const activeVersion = this.getActiveScheduleVersion();
    const targetVersionId = versionId || activeVersion?.id;

    return this.db.schedules.filter((item) => {
      const matchVersion = !targetVersionId || item.scheduleVersionId === targetVersionId;
      // Allow flexible class matching: '8A' matches '8A' or '8-A'
      const normInput = className ? className.trim().toUpperCase().replace(/[^0-9A-ZD]/g, '') : '';
      const normItem = item.className.trim().toUpperCase().replace(/[^0-9A-ZD]/g, '');
      const matchClass = !className || normItem === normInput;
      return matchVersion && matchClass;
    });
  }

  public createScheduleItem(item: ScheduleItem): ScheduleItem {
    if (!this.db) throw new Error('DB not initialized');
    this.db.schedules.push(item);
    this.save();
    return item;
  }

  public updateScheduleItem(id: string, updates: Partial<ScheduleItem>): ScheduleItem | null {
    if (!this.db) return null;
    const idx = this.db.schedules.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.db.schedules[idx] = { ...this.db.schedules[idx], ...updates };
    this.save();
    return this.db.schedules[idx];
  }

  public deleteScheduleItem(id: string): boolean {
    if (!this.db) return false;
    const initialLen = this.db.schedules.length;
    this.db.schedules = this.db.schedules.filter((s) => s.id !== id);
    if (this.db.schedules.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public bulkInsertSchedules(items: ScheduleItem[], newVersion: ScheduleVersion, replaceActive: boolean): void {
    if (!this.db) throw new Error('DB not initialized');

    if (replaceActive) {
      this.db.scheduleVersions.forEach((v) => {
        v.isActive = false;
      });
      newVersion.isActive = true;
    }

    this.db.scheduleVersions.push(newVersion);
    this.db.schedules.push(...items);
    this.save();
  }

  public replaceAllActiveSchedules(items: ScheduleItem[], newVersion: ScheduleVersion): void {
    if (!this.db) throw new Error('DB not initialized');

    const oldActiveVersion = this.getActiveScheduleVersion();
    if (oldActiveVersion) {
      oldActiveVersion.isActive = false;
      this.db.schedules = this.db.schedules.filter((s) => s.scheduleVersionId !== oldActiveVersion.id);
    }

    newVersion.isActive = true;
    this.db.scheduleVersions.push(newVersion);
    this.db.schedules.push(...items);
    this.save();
  }

  // --- Teachers ---
  public getTeachers(): Teacher[] {
    return this.db?.teachers || [];
  }

  public createTeacher(teacher: Teacher): Teacher {
    if (!this.db) throw new Error('DB not initialized');
    this.db.teachers.push(teacher);
    this.save();
    return teacher;
  }

  public updateTeacher(id: string, updates: Partial<Teacher>): Teacher | null {
    if (!this.db) return null;
    const idx = this.db.teachers.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.db.teachers[idx] = { ...this.db.teachers[idx], ...updates };
    this.save();
    return this.db.teachers[idx];
  }

  public deleteTeacher(id: string): boolean {
    if (!this.db) return false;
    const len = this.db.teachers.length;
    this.db.teachers = this.db.teachers.filter((t) => t.id !== id);
    if (this.db.teachers.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- News ---
  public getNews(publishedOnly = false): NewsArticle[] {
    if (!this.db) return [];
    let list = [...this.db.news];
    if (publishedOnly) {
      list = list.filter((n) => n.isPublished);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getNewsBySlug(slug: string): NewsArticle | undefined {
    return this.db?.news.find((n) => n.slug === slug);
  }

  public createNews(article: NewsArticle): NewsArticle {
    if (!this.db) throw new Error('DB not initialized');
    this.db.news.unshift(article);
    this.save();
    return article;
  }

  public updateNews(id: string, updates: Partial<NewsArticle>): NewsArticle | null {
    if (!this.db) return null;
    const idx = this.db.news.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    this.db.news[idx] = { ...this.db.news[idx], ...updates };
    this.save();
    return this.db.news[idx];
  }

  public deleteNews(id: string): boolean {
    if (!this.db) return false;
    const len = this.db.news.length;
    this.db.news = this.db.news.filter((n) => n.id !== id);
    if (this.db.news.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Announcements ---
  public getAnnouncements(activeOnly = false): Announcement[] {
    if (!this.db) return [];
    let list = [...this.db.announcements];
    if (activeOnly) {
      const now = new Date();
      list = list.filter((a) => {
        if (!a.isActive) return false;
        if (a.expiryDate && new Date(a.expiryDate) < now) return false;
        return true;
      });
    }
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public createAnnouncement(ann: Announcement): Announcement {
    if (!this.db) throw new Error('DB not initialized');
    this.db.announcements.unshift(ann);
    this.save();
    return ann;
  }

  public updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
    if (!this.db) return null;
    const idx = this.db.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.db.announcements[idx] = { ...this.db.announcements[idx], ...updates };
    this.save();
    return this.db.announcements[idx];
  }

  public deleteAnnouncement(id: string): boolean {
    if (!this.db) return false;
    const len = this.db.announcements.length;
    this.db.announcements = this.db.announcements.filter((a) => a.id !== id);
    if (this.db.announcements.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Gallery ---
  public getGallery(): GalleryItem[] {
    return this.db?.gallery || [];
  }

  public createGalleryItem(item: GalleryItem): GalleryItem {
    if (!this.db) throw new Error('DB not initialized');
    this.db.gallery.unshift(item);
    this.save();
    return item;
  }

  public deleteGalleryItem(id: string): boolean {
    if (!this.db) return false;
    const len = this.db.gallery.length;
    this.db.gallery = this.db.gallery.filter((g) => g.id !== id);
    if (this.db.gallery.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Achievements (Maktabimiz Faxrlari) ---
  public getAchievements(visibleOnly = false): SchoolAchievement[] {
    if (!this.db || !this.db.achievements) return [];
    let list = [...this.db.achievements];
    if (visibleOnly) {
      list = list.filter((a) => a.isVisible !== false);
    }
    return list.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getAchievementById(id: string): SchoolAchievement | undefined {
    return this.db?.achievements?.find((a) => a.id === id);
  }

  public createAchievement(item: SchoolAchievement): SchoolAchievement {
    if (!this.db) throw new Error('DB not initialized');
    if (!this.db.achievements) this.db.achievements = [];
    this.db.achievements.unshift(item);
    this.save();
    return item;
  }

  public updateAchievement(id: string, updates: Partial<SchoolAchievement>): SchoolAchievement | null {
    if (!this.db || !this.db.achievements) return null;
    const idx = this.db.achievements.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.db.achievements[idx] = { ...this.db.achievements[idx], ...updates };
    this.save();
    return this.db.achievements[idx];
  }

  public deleteAchievement(id: string): boolean {
    if (!this.db || !this.db.achievements) return false;
    const len = this.db.achievements.length;
    this.db.achievements = this.db.achievements.filter((a) => a.id !== id);
    if (this.db.achievements.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Videos (Maktabimiz Videolari) ---
  public getVideos(visibleOnly = false): SchoolVideo[] {
    if (!this.db || !this.db.videos) return [];
    let list = [...this.db.videos];
    if (visibleOnly) {
      list = list.filter((v) => v.isVisible !== false);
    }
    return list.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getVideoById(id: string): SchoolVideo | undefined {
    return this.db?.videos?.find((v) => v.id === id);
  }

  public createVideo(item: SchoolVideo): SchoolVideo {
    if (!this.db) throw new Error('DB not initialized');
    if (!this.db.videos) this.db.videos = [];
    this.db.videos.unshift(item);
    this.save();
    return item;
  }

  public updateVideo(id: string, updates: Partial<SchoolVideo>): SchoolVideo | null {
    if (!this.db || !this.db.videos) return null;
    const idx = this.db.videos.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    this.db.videos[idx] = { ...this.db.videos[idx], ...updates };
    this.save();
    return this.db.videos[idx];
  }

  public deleteVideo(id: string): boolean {
    if (!this.db || !this.db.videos) return false;
    const len = this.db.videos.length;
    this.db.videos = this.db.videos.filter((v) => v.id !== id);
    if (this.db.videos.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Messages ---
  public getMessages(): ContactMessage[] {
    if (!this.db) return [];
    return [...this.db.messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createMessage(msg: ContactMessage): ContactMessage {
    if (!this.db) throw new Error('DB not initialized');
    this.db.messages.unshift(msg);
    this.save();
    return msg;
  }

  public markMessageRead(id: string, isRead = true): boolean {
    if (!this.db) return false;
    const msg = this.db.messages.find((m) => m.id === id);
    if (msg) {
      msg.isRead = isRead;
      this.save();
      return true;
    }
    return false;
  }

  public deleteMessage(id: string): boolean {
    if (!this.db) return false;
    const len = this.db.messages.length;
    this.db.messages = this.db.messages.filter((m) => m.id !== id);
    if (this.db.messages.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Activity Logs ---
  public getActivityLogs(limit = 30): AdminActivityLog[] {
    if (!this.db) return [];
    return [...this.db.activityLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public logActivity(adminUsername: string, action: string, details: string): void {
    if (!this.db) return;
    this.db.activityLogs.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminUsername,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
    if (this.db.activityLogs.length > 200) {
      this.db.activityLogs = this.db.activityLogs.slice(0, 200);
    }
    this.save();
  }

  // --- Stats ---
  public getAdminStats() {
    return {
      totalClasses: this.db?.classes.length || 0,
      totalTeachers: this.db?.teachers.length || 0,
      activeScheduleVersion: this.getActiveScheduleVersion()?.title || 'Jadval kiritilmagan',
      totalNews: this.db?.news.length || 0,
      totalAnnouncements: this.db?.announcements.length || 0,
      totalGallery: this.db?.gallery.length || 0,
      totalAchievements: this.db?.achievements?.length || 0,
      totalVideos: this.db?.videos?.length || 0,
      unreadMessages: this.db?.messages.filter((m) => !m.isRead).length || 0,
      totalMessages: this.db?.messages.length || 0,
      firstLessonStartTime: this.db?.school.scheduleConfig.firstLessonStartTime || '08:00',
    };
  }
}

export const dbService = new DatabaseService();
