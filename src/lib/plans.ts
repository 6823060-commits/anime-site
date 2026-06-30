export type PlanType = "FREE" | "BASIC" | "PREMIUM";

export interface Plan {
  id: PlanType;
  name: string;
  nameEn: string;
  price: number; // MNT
  duration: number; // days
  color: string;
  features: string[];
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Үнэгүй",
    nameEn: "Free",
    price: 0,
    duration: 0,
    color: "#9090a8",
    features: [
      "Үнэгүй ангиуд үзэх",
      "Сэтгэгдэл бичих",
      "Дуртай жагсаалт",
      "720p чанар",
    ],
  },
  {
    id: "BASIC",
    name: "Суурь",
    nameEn: "Basic",
    price: 4900,
    duration: 30,
    color: "#6c63ff",
    badge: "Алдартай",
    features: [
      "Бүх FREE боломжууд",
      "Premium ангиуд үзэх",
      "1080p чанар",
      "Сурталчилгаагүй",
      "30 хоног",
    ],
  },
  {
    id: "PREMIUM",
    name: "Премиум",
    nameEn: "Premium",
    price: 9900,
    duration: 30,
    color: "#f59e0b",
    badge: "Шилдэг",
    features: [
      "Бүх BASIC боломжууд",
      "4K чанар",
      "Offline татаж авах",
      "Эрт нэвтрэх (Early Access)",
      "Тусгай тэмдэглэгээ",
      "30 хоног",
    ],
  },
];

export function getPlan(id: PlanType): Plan {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}

export function canWatch(userPlan: PlanType, requiredPlan: PlanType): boolean {
  const order: PlanType[] = ["FREE", "BASIC", "PREMIUM"];
  return order.indexOf(userPlan) >= order.indexOf(requiredPlan);
}

export function isPremiumActive(planExpiresAt: Date | null, plan: PlanType): boolean {
  if (plan === "FREE") return false;
  if (!planExpiresAt) return false;
  return new Date() < new Date(planExpiresAt);
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString("mn-MN") + "₮";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
