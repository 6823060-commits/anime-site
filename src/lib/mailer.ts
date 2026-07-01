import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendResetEmail(to: string, code: string, name?: string | null) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0f; color: #e8e8f0; padding: 32px; border-radius: 12px;">
      <h1 style="color: #6c63ff; font-size: 24px; margin-bottom: 8px;">アニメMN</h1>
      <h2 style="font-size: 18px; margin-bottom: 16px;">Нууц үг сэргээх</h2>
      <p style="color: #9090a8;">Сайн байна уу${name ? `, ${name}` : ""}!</p>
      <p style="color: #9090a8; margin-bottom: 24px;">Нууц үг сэргээх хүсэлт ирлээ. Доорх кодыг оруулна уу:</p>
      <div style="background: #16161f; border: 2px solid #6c63ff; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6c63ff;">${code}</span>
      </div>
      <p style="color: #5a5a72; font-size: 13px;">⏱ Код 5 минутын хугацаанд хүчинтэй.</p>
      <p style="color: #5a5a72; font-size: 13px;">Хэрэв та энэ хүсэлт гаргаагүй бол энэ имэйлийг үл тоомсорлоно уу.</p>
    </div>
  `;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    // DEV mode
    console.log(`[DEV EMAIL] → ${to}: Код = ${code}`);
    return { ok: true, dev: true };
  }

  await transporter.sendMail({
    from: `"АнимэMN" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${code} — Нууц үг сэргээх код`,
    html,
  });

  return { ok: true };
}