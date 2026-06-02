export function validateEmail(email: string): boolean {
  const normalized = String(email || "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalized);
}

export function validatePhoneNumber(phone: string): boolean {
  const normalized = String(phone || "").replace(/\D/g, "");
  return /^[0-9]{10,15}$/.test(normalized);
}

export function normalizeUsername(username: string): string {
  return String(username || "").trim().toLowerCase();
}

export function normalizePhoneNumber(phone: string): string {
  return String(phone || "").replace(/\D/g, "");
}

export function validatePassword(password: string): boolean {
  return typeof password === "string" && password.length >= 8;
}
