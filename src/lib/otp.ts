import { prisma } from "./prisma";
import { sendResetEmail } from "./mailer";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createEmailOtp(userId: string, email: string) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Хуучин OTP-г устгана
  await prisma.otpCode.deleteMany({
    where: { userId, purpose: "PASSWORD_RESET" },
  });

  const otp = await prisma.otpCode.create({
    data: {
      userId,
      phone: email,
      code,
      purpose: "PASSWORD_RESET",
      expiresAt,
    },
  });

  console.log("✅ OTP created:", { id: otp.id, userId, email, code, expiresAt });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  await sendResetEmail(email, code, user?.name);

  return code;
}

export async function verifyEmailOtp(userId: string, email: string, code: string) {
  // Debug: DB дэх бүх OTP-г харах
  const allOtps = await prisma.otpCode.findMany({
    where: { userId },
  });
  console.log("🔍 All OTPs for user:", JSON.stringify(allOtps, null, 2));

  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      phone: email,
      purpose: "PASSWORD_RESET",
      used: false,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("🎯 Found OTP:", otp);
  console.log("📝 Input code:", code, "| DB code:", otp?.code);

  if (!otp) return { valid: false, error: "Код олдсонгүй. Дахин хүснэ үү." };
  if (new Date() > otp.expiresAt) return { valid: false, error: "Кодны хугацаа дууссан байна." };
  if (otp.attempts >= 5) return { valid: false, error: "Хэт олон удаа буруу оруулсан байна." };

  if (otp.code !== code.trim()) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { valid: false, error: `Код буруу байна. ${4 - otp.attempts} оролдлого үлдсэн.` };
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
  return { valid: true };
}