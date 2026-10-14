import { Router, Request, Response } from 'express';
import { dbService } from '../db/database.ts';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';

const router = Router();

// GET /api/news
router.get('/', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    let list = dbService.getNews(true);

    if (category && category !== 'Hammasi') {
      list = list.filter((n) => n.category && n.category.toLowerCase() === category.toLowerCase());
    }

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Yangiliklarni olishda xatolik.' });
  }
});

// GET /api/news/admin - All news including drafts
router.get('/admin', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const list = dbService.getNews(false);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Yangiliklarni olishda xatolik.' });
  }
});

// GET /api/news/:slug
router.get('/:slug', (req: Request, res: Response) => {
  try {
    const article = dbService.getNewsBySlug(req.params.slug);
    if (!article) {
      return res.status(404).json({ error: 'Yangilik topilmadi.' });
    }
    res.json(article);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Xatolik.' });
  }
});

// Helper slug generator
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `news-${Date.now()}`;
}

// POST /api/news (Admin only)
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, summary, content, coverImage, category, author } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Sarlavha va matn kiritilishi shart.' });
    }

    const slug = generateSlug(title) + `-${Math.random().toString(36).substring(2, 6)}`;
    const newArticle = dbService.createNews({
      id: `news-${Date.now()}`,
      slug,
      title,
      summary: summary || title.slice(0, 120),
      content,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
      category: category || 'O\'quv jarayoni',
      author: author || req.user?.fullName || 'Maktab Ma\'muriyati',
      isPublished: true,
      views: 0,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    dbService.logActivity(req.user?.username || 'Admin', 'NEWS_CREATE', `Yangilik e'lon qilindi: ${title}`);
    res.status(201).json(newArticle);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Yangilik yaratishda xatolik.' });
  }
});

// PUT /api/news/:id (Admin only)
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = dbService.updateNews(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Yangilik topilmadi.' });
    }
    dbService.logActivity(req.user?.username || 'Admin', 'NEWS_UPDATE', `Yangilik tahrirlandi: ${updated.title}`);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Yangilikni yangilashda xatolik.' });
  }
});

// DELETE /api/news/:id (Admin only)
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = dbService.deleteNews(id);
    if (!ok) {
      return res.status(404).json({ error: 'Yangilik topilmadi.' });
    }
    dbService.logActivity(req.user?.username || 'Admin', 'NEWS_DELETE', `Yangilik o'chirildi (ID: ${id})`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Yangilikni o\'chirishda xatolik.' });
  }
});

export default router;
