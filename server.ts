import express from 'express';
import path from 'path';
import fs from 'fs';
import { dbService } from './server/db/database.ts';
import authRoutes from './server/routes/authRoutes.ts';
import scheduleRoutes from './server/routes/scheduleRoutes.ts';
import teacherRoutes from './server/routes/teacherRoutes.ts';
import newsRoutes from './server/routes/newsRoutes.ts';
import announcementRoutes from './server/routes/announcementRoutes.ts';
import eventRoutes from './server/routes/eventRoutes.ts';
import achievementRoutes from './server/routes/achievementRoutes.ts';
import galleryRoutes from './server/routes/galleryRoutes.ts';
import contactRoutes from './server/routes/contactRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import schoolRoutes from './server/routes/schoolRoutes.ts';
import videoRoutes from './server/routes/videoRoutes.ts';
import uploadRoutes from './server/routes/uploadRoutes.ts';

async function startServer() {
  await dbService.init();

  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Ensure uploads directory exists
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static uploads (images & videos streaming)
  app.use('/uploads', express.static(uploadsDir));
  app.use(express.static(path.resolve(process.cwd(), 'public')));

  // API Route Mounts
  app.use('/api/auth', authRoutes);
  app.use('/api/schedule', scheduleRoutes);
  app.use('/api/classes', (req, res, next) => {
    // Route alias for /api/classes -> /api/schedule/classes
    req.url = '/classes' + (req.url === '/' ? '' : req.url);
    scheduleRoutes(req, res, next);
  });
  app.use('/api/teachers', teacherRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/achievements', achievementRoutes);
  app.use('/api/videos', videoRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/messages', contactRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/school', schoolRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      school: '43-umumiy o\'rta ta\'lim maktabi',
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');

  if (!isProduction && fs.existsSync(path.resolve(process.cwd(), 'index.html'))) {
    // Vite Dev Middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite dev middleware initialized.');
  } else if (fs.existsSync(distPath)) {
    // Production static files
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('📦 Serving production static build from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 43-Maktab server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
