# 43-Maktab — Rasmiy Zamonaviy Maktab Web Platformasi

43-umumiy o'rta ta'lim maktabining rasmiy elektron portali va axborot tizimi. Ushbu platforma maktab ma'muriyati, o'qituvchilar, o'quvchilar va ota-onalar o'rtasida real vaqt rejimida samarali elektron muloqot va o'quv jarayonini boshqarishni ta'minlaydi.

---

## 📌 Asosiy Xususiyatlar va Imkoniyatlar

1. **Dars Jadvali Moduli (Markaziy funksiya)**:
   - 23 ta sinf (`1A, 1B, 1D, 2A, 2B, 2D, ... 11A`) uchun to'liq dars jadvali.
   - 6 kunlik ta'lim tizimi (`Dushanba, Seshanba, Chorshanba, Payshanba, Juma, Shanba`).
   - 6 ta dars vaqti (08:00–08:45, 08:50–09:35, 09:40–10:25, 10:50–11:35, 11:40–12:25, 12:30–13:15).
   - Tanlangan sinf (masalan `8A`) bo'yicha maqsadli yuklash (`GET /api/schedule?class=8A`).
   - **Bugun** rejimi: hozirgi dars, keyingi dars va o'tgan darslarni server vaqti bo'yicha jonli aniqlash.
   - Namunaviy Excel shablonini yuklab olish imkoniyati.

2. **Excel Import va Jadval Boshqaruvi**:
   - `dars jadval.xlsx` faylini avtomatik tahlil qilish (sinflar, kunlar, soatlar va fanlarni parse qilish).
   - **Import Preview**: Qatorlar, sinflar, kunlar va dars soatlari soni bilan tasdiqlash oynasi.
   - **Almashtirish / Arxivlash tanlovi**: Yangi jadvalni eskisining o'rniga qo'yish yoki arxivda saqlash.
   - Darslarni qo'lda qo'shish, tahrirlash va o'chirish (CRUD).

3. **Autentifikatsiya va Rollar**:
   - Boshlang'ich tanlov oynasi: **O'QUVCHI** va **ADMIN**.
   - Admin hisobi: `ShuhratjonDEV` / `admin2011`.
   - Xavfsizlik: Bcrypt password hashing, JWT sessiyalar, HTTP role-based authorization (403 Forbidden).
   - O'quvchi kabineti: faqat o'z sinfi dars jadvali, e'lonlar va yangiliklarni ko'rish.

4. **Maktab Ommaviy Sahifalari**:
   - **Bosh sahifa**: interfaol dars jadvali, maktab statistikasi, yangiliklar va tadbirlar.
   - **Maktab haqida**: Tarix, missiya, maqsadlar, qadriyatlar va rahbariyat qabul vaqtlari.
   - **O'qituvchilar**: Qidiruv va fanlar bo'yicha filtr, pedagoglar toifasi va tajribasi.
   - **Yangiliklar & E'lonlar**: Toifalar, pinning va amal qilish muddatlari.
   - **Tadbirlar & Yutuqlar**: Fan olimpiadalari g'oliblari, kalendar taqvimi.
   - **Galereya**: Toifalar bo'yicha filtrlash va Lightbox ko'rinishi.
   - **Aloqa**: Interfaol xarita, telefonlar va ma'lumotlar bazasiga saqlanuvchi murojaat shakli.

---

## 🛠 Texnologiyalar Steki

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Modern Motion.
- **Backend**: Node.js, Express, Multer (fayl yuklash uchun).
- **Excel Parsing**: SheetJS (`xlsx`).
- **Autentifikatsiya**: JSON Web Token (`jsonwebtoken`), `bcryptjs`.
- **Database**: ACID-muvofiq relational saqlash va indeksatsiya tizimi (`data/school_db.json`), Prisma/PostgreSQL arxitekturasi uchun to'liq mos modellar.

---

## 🚀 O'rnatish va Ishga Tushirish

### 1. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 2. Muhit o'zgaruvchilari (.env)
Loyihaning ildiz papkasida `.env` faylini yarating:
```env
PORT=3000
ADMIN_USERNAME=ShuhratjonDEV
ADMIN_PASSWORD=admin2011
JWT_SECRET=your-secure-jwt-secret-key
```

### 3. Dasturni ishga tushirish (Development)
```bash
npm run dev
```
Platforma `http://localhost:3000` manzilida ishga tushadi.

### 4. Ishlab chiqarish uchun yig'ish (Production Build)
```bash
npm run build
npm start
```

---

## 🔐 Boshlang'ich Kirish Ma'lumotlari (Seed)

| Foydalanuvchi turi | Login (Username) | Parol | Ruxsatlar |
|---|---|---|---|
| **Admin** | `ShuhratjonDEV` | `admin2011` | To'liq tizim va dars jadvali boshqaruvi |
| **8-A o'quvchisi** | `student_8a` | `student123` | 8-A sinf jadvali va o'quvchi kabineti |
| **10-A o'quvchisi** | `student_10a` | `student123` | 10-A sinf jadvali va o'quvchi kabineti |
| **11-A o'quvchisi** | `student_11a` | `student123` | 11-A sinf jadvali va o'quvchi kabineti |

---

## 🛡 Xavfsizlik Choralar

- Parollar ma'lumotlar bazasida doimo `bcrypt` orqali tuzlangan va xeshlangan holatda saqlanadi.
- Frontend JavaScript kodida maxfiy kalitlar va parollar ochiq qoldirilmaydi.
- Admin yo'nalishlari (`/api/admin/*`, `/api/schedule/parse-excel`, `/api/schedule/confirm-import`) server darajasida `requireAdmin` middleware orqali himoyalangan.
- Excel fayllari faqat `.xlsx` va `.xls` formatlari bo'yicha tekshiriladi va 15MB bilan cheklangan.
