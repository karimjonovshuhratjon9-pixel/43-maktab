import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/events - Neutral empty state (no fake events)
router.get('/', (_req: Request, res: Response) => {
  res.json([]);
});

router.post('/', (_req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

router.put('/:id', (_req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

router.delete('/:id', (_req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

export default router;
