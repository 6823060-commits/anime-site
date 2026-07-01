import { prisma } from "./prisma";
import { sendResetEmail } from "./mailer";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createEmailOtp(userId: string, email: string) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otpCode.deleteMany({
    where: {
      userId,
      purpose: "PASSWORD_RESET",
    },
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

  console.log("✅ OTP created:", {
    id: otp.id,
    userId,
    email,
    expiresAt,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  await sendResetEmail(email, code, user?.name);

  return code;
}

type OtpResult =
  | { valid: true }
  | { valid: false; error: string };

async function validatePasswordResetOtp(
  userId: string,
  email: string,
  code: string,
  consume: boolean
): Promise<OtpResult> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      phone: email,
      purpose: "PASSWORD_RESET",
      used: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otp) {
    return {
      valid: false,
      error: "Код олдсонгүй. Дахин код хүснэ үү.",
    };
  }

  if (new Date() > otp.expiresAt) {
    return {
      valid: false,
      error: "Кодны хугацаа дууссан байна. Дахин код хүснэ үү.",
    };
  }

  if (otp.attempts >= 5) {
    return {
      valid: false,
      error: "Хэт олон удаа буруу оруулсан байна. Дахин код хүснэ үү.",
    };
  }

  if (otp.code !== code.trim()) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    return {
      valid: false,
      error: `Код буруу байна. ${Math.max(0, 4 - otp.attempts)} оролдлого үлдсэн.`,
    };
  }

  if (consume) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: {
        used: true,
      },
    });
  }

  return { valid: true };
}

// Зөвхөн шалгана, used:true болгохгүй
export async function checkEmailOtp(
  userId: string,
  email: string,
  code: string
) {
  return validatePasswordResetOtp(userId, email, code, false);
}

// Нууц үг солих үед ашиглана, амжилттай бол used:true болгоно
export async function consumeEmailOtp(
  userId: string,
  email: string,
  code: string
) {
  return validatePasswordResetOtp(userId, email, code, true);
}