// ─── Phone validation ────────────────────────────────────────────────────────

export function isValidUzPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^998\d{9}$/.test(cleaned);
}

// ─── Email validation ────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── Password validation ──────────────────────────────────────────────────────

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}

// ─── Plate number (Uzbekistan) ────────────────────────────────────────────────

export function isValidPlateNumber(plate: string): boolean {
  return /^[0-9]{2}[A-Z]{1,2}[0-9]{3}[A-Z]{2}$/.test(plate.toUpperCase().replace(/\s/g, ''));
}

// ─── Generic ─────────────────────────────────────────────────────────────────

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isPositiveNumber(value: number | string): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
}
