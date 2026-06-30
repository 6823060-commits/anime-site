# アニメMN — Монгол Анимэ Стриминг Сайт

Novel site-тай адилхан бүтэцтэй, анимэ стриминг хийдэг full-stack Next.js вэб аппликейшн.

## Технологи

- **Next.js 15** (App Router, TypeScript)
- **Prisma ORM** + **PostgreSQL**
- **NextAuth.js v5** (email/password)
- **Tailwind CSS v4**

## Боломжууд

- 🎬 Анимэ жагсаалт, хайлт, жанрын шүүлтүүр
- ▶️ Видео тоглуулагч (HTML5 `<video>`) — шууд файл тоглуулна
- 📺 Ангиудын жагсаалт, өмнөх/дараагийн анги
- ❤️ Дуртай анимэ хадгалах
- 💬 Ангид сэтгэгдэл бичих
- 📜 Үзсэн түүх автоматаар хадгалах
- 🛡️ Админ хэсэг — анимэ, анги, жанр удирдах

## Суулгах

### 1. Орчин тохируулах

```bash
git clone <repo-url>
cd anime-site
npm install
```

### 2. .env файл үүсгэх

```bash
cp .env.example .env
```

`.env` файлд өөрийн PostgreSQL connection string-ийг оруулна:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/anime_site"
NEXTAUTH_SECRET="хангалттай урт нууц үг"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Өгөгдлийн сан

```bash
# Migration ажиллуулах
npm run db:migrate

# Жишээ өгөгдөл нэмэх (анимэ, жанр, admin хэрэглэгч)
npm run db:seed
```

**Admin нэвтрэх:** `admin@anime.mn` / `admin123`

### 4. Эхлүүлэх

```bash
npm run dev
```

http://localhost:3000 дээр нээнэ.

## Видео тоглуулагч тухай

Сайт нь HTML5 `<video>` тагийг ашигладаг тул дараах форматуудыг шууд тоглуулна:

- `.mp4` (H.264) — хамгийн өргөн дэмжлэгтэй
- `.webm` (VP9)
- `.ogg`
- HLS (`.m3u8`) — Safari дэмжнэ, бусадт hls.js шаардлагатай

Админ хэсэгт анги нэмэхдээ **видео URL** талбарт файлын шууд холбоосыг оруулна. Жишээ нь:
- Өөрийн серверт байршуулсан: `https://myserver.com/videos/ep1.mp4`
- Cloudflare R2, AWS S3, Bunny CDN гэх мэт CDN холбоос

## Хавтасны бүтэц

```
src/
├── app/
│   ├── page.tsx              # Нүүр хуудас
│   ├── anime/                # Анимэ жагсаалт + дэлгэрэнгүй
│   ├── watch/[animeId]/      # Видео үзэх хуудас
│   ├── search/               # Хайлт
│   ├── genres/               # Жанрууд
│   ├── favorites/            # Дуртай анимэ
│   ├── history/              # Үзсэн түүх
│   ├── auth/                 # Нэвтрэх / бүртгүүлэх
│   ├── admin/                # Админ хэсэг
│   └── api/                  # REST API routes
├── components/
│   ├── anime/                # AnimeCard, VideoPlayer, CommentsSection...
│   ├── admin/                # AnimeForm, EpisodeForm, GenreManager...
│   └── layout/               # Navbar, SessionProvider
└── lib/
    ├── auth.ts               # NextAuth тохиргоо
    └── prisma.ts             # Prisma client
prisma/
├── schema.prisma             # Өгөгдлийн бүтэц
└── seed.ts                   # Жишээ өгөгдөл
```

## Deployment

### Vercel + Neon/Supabase PostgreSQL

```bash
# Vercel CLI
npm i -g vercel
vercel

# Environment variables тохируулах
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
