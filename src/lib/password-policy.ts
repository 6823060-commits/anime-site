export interface PasswordCheck {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordCheck {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Хамгийн багадаа 8 тэмдэгт байх ёстой.");
  if (!/[A-Z]/.test(password)) errors.push("Дор хаяж 1 том үсэг (A-Z) агуулсан байх.");
  if (!/[a-z]/.test(password)) errors.push("Дор хаяж 1 жижиг үсэг (a-z) агуулсан байх.");
  if (!/[0-9]/.test(password)) errors.push("Дор хаяж 1 тоо (0-9) агуулсан байх.");
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) errors.push("Дор хаяж 1 тусгай тэмдэгт (!@#$%^&* гэх мэт) агуулсан байх.");
  return { valid: errors.length === 0, errors };
}