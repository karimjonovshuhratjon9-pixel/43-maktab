import { Router, Response, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAdmin, AuthenticatedRequest } from '../auth/authMiddleware.ts';

const router = Router();

const ROOT_UPLOADS = path.resolve(process.cwd(), 'uploads');
const IMAGES_DIR = path.join(ROOT_UPLOADS, 'images');
const VIDEOS_DIR = path.join(ROOT_UPLOADS, 'videos');

// Ensure upload folders exist
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });

// Storage config
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, VIDEOS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `vid-${uniqueSuffix}${ext}`);
  },
});

// Image upload middleware (15MB)
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(file.originalname);
    if (isImage) {
      cb(null, true);
    } else {
      cb(new Error("Faqat rasm fayllari (JPG, PNG, WebP, GIF) qabul qilinadi."));
    }
  },
});

// Video upload middleware (up to 500MB, all video formats)
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (_req, file, cb) => {
    const isVideo =
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/octet-stream' ||
      /\.(mp4|webm|mov|m4v|ogg|avi|mkv|3gp|flv|wmv|ts|m2ts)$/i.test(file.originalname);

    if (isVideo) {
      cb(null, true);
    } else {
      cb(new Error("Faqat video formatidagi fayllar qabul qilinadi (MP4, WebM, MOV, AVI, MKV)."));
    }
  },
});

// POST /api/upload/image (Admin only)
router.post('/image', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  uploadImage.single('file')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "Rasm hajmi juda katta. Maksimal ruxsat etilgan hajm: 15 MB." });
      }
      return res.status(400).json({ error: err.message || "Rasm yuklashda xatolik yuz berdi." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Hech qanday rasm fayli tanlanmadi." });
    }

    const publicUrl = `/uploads/images/${req.file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});

// POST /api/upload/video (Admin only)
router.post('/video', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  // Prevent socket timeout during large uploads
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000);

  uploadVideo.single('file')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "Video hajmi juda katta. Maksimal ruxsat etilgan hajm: 500 MB." });
      }
      return res.status(400).json({ error: err.message || "Video yuklashda xatolik yuz berdi." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Hech qanday video fayli tanlanmadi." });
    }

    const publicUrl = `/uploads/videos/${req.file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});

// GET /api/upload/videos/:filename - Progressive video streaming with Range support
router.get('/videos/:filename', (req: Request, res: Response) => {
  const filePath = path.join(VIDEOS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Video fayl topilmadi');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const ext = path.extname(filePath).toLowerCase();

  const mimeMap: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.m4v': 'video/x-m4v',
    '.ogg': 'video/ogg',
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
  };
  const contentType = mimeMap[ext] || 'video/mp4';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

export default router;
