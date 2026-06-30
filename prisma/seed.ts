import { PrismaClient, Role, AnimeStatus, AnimeType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("admin123", 12);

  // Admin user
  await prisma.user.upsert({
    where: { email: "admin@anime.mn" },
    update: {},
    create: { email: "admin@anime.mn", name: "Админ", password: hashed, role: Role.ADMIN },
  });

  // Editor user
  const editorHash = await bcrypt.hash("editor123", 12);
  await prisma.user.upsert({
    where: { email: "editor@anime.mn" },
    update: {},
    create: { email: "editor@anime.mn", name: "Редактор", password: editorHash, role: Role.EDITOR },
  });

  // Genres
  const genreNames = ["Экшн", "Романтик", "Инисгэлэнт", "Аймшиг", "Фантастик", "Спорт", "Адал явдал", "Ид шид", "Мэдрэмж", "Тулаан"];
  const genreMap: Record<string, string> = {};
  for (const name of genreNames) {
    const g = await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
    genreMap[name] = g.id;
  }

  // Sample animes with mixed free/premium episodes
  const animes = [
    {
      title: "Атак он Титан",
      titleEn: "Attack on Titan",
      description: "Хүн төрөлхтөн аварга том титануудаас хамгаалахын тулд дотор нь хоригдон суусан хотуудад амьдарч байна.",
      status: AnimeStatus.COMPLETED, type: AnimeType.TV, year: 2013, season: "Хавар", rating: 9.0, totalEps: 75,
      coverImage: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
      genres: ["Экшн", "Адал явдал", "Тулаан"],
      episodes: [
        { number: 1, title: "Хоёр мянган жилийн дараа", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", duration: 1440, isPremium: false, requiredPlan: "FREE" },
        { number: 2, title: "Тэр өдөр", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", duration: 1440, isPremium: false, requiredPlan: "FREE" },
        { number: 3, title: "Гэрчлэл", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", duration: 1440, isPremium: true, requiredPlan: "BASIC" },
        { number: 4, title: "Тулааны давалгаа", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", duration: 1440, isPremium: true, requiredPlan: "PREMIUM" },
      ],
    },
    {
      title: "Нэг Цохилтоор",
      titleEn: "One Punch Man",
      description: "Сайтама гэдэг баатар хэн ч бай нэг л цохилтоор дийлдэг болсон тул амьдралдаа утга олохгүй болжээ.",
      status: AnimeStatus.COMPLETED, type: AnimeType.TV, year: 2015, season: "Намар", rating: 8.7, totalEps: 24,
      coverImage: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
      genres: ["Экшн", "Инисгэлэнт", "Тулаан"],
      episodes: [
        { number: 1, title: "Хэт хүчтэй болов", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", duration: 1440, isPremium: false, requiredPlan: "FREE" },
        { number: 2, title: "Хамгийн хурдан баатар", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", duration: 1440, isPremium: true, requiredPlan: "BASIC" },
      ],
    },
  ];

  for (const { genres, episodes, ...data } of animes) {
    const anime = await prisma.anime.create({
      data: {
        ...data,
        genres: { create: genres.filter(g => genreMap[g]).map(g => ({ genreId: genreMap[g] })) },
        episodes: { create: episodes },
      },
    });
    console.log(`✓ ${anime.title}`);
  }

  console.log("\n✅ Seed дууслаа!");
  console.log("Admin:  admin@anime.mn / admin123");
  console.log("Editor: editor@anime.mn / editor123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
