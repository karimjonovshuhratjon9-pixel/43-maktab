import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from './authService.ts';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Avtorizatsiya talab etiladi. Tizimga kiring.' });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({ error: 'Token topilmadi.' });
  }

  try {
    const payload = AuthService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Avtorizatsiya xatosi.' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Ushbu amalni bajarish uchun faqat ADMIN huquqi talab etiladi (403 Forbidden).' });
    }
    next();
  });
}
