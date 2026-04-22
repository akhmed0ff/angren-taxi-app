export function isValidPhone(phone: string): boolean {
  return /^\+?[0-9]{9,15}$/.test(phone.replace(/\s/g, ''));
}

export function isValidUserType(type: string): type is 'passenger' | 'driver' | 'admin' {
  return type === 'passenger' || type === 'driver' || type === 'admin';
}

/**
 * Имя: не пустое после trim, длина от 2 до 64 символов.
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 64;
}

/**
 * Пароль: минимум 8 символов, максимум 128 (защита от аномально длинных строк, которые
 * замедляют bcrypt).
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && password.length <= 128;
}

export function isValidCategory(category: string): category is 'economy' | 'comfort' | 'premium' {
  return ['economy', 'comfort', 'premium'].includes(category);
}

export function isValidPaymentMethod(method: string): method is 'cash' | 'card' {
  return method === 'cash' || method === 'card';
}

/**
 * Проверяет, что значение является числом и находится в допустимом диапазоне.
 * typeof-проверка защищает от передачи строк или null/undefined через JSON-тело запроса.
 */
export function isValidLatitude(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value) && value >= -180 && value <= 180;
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\s/g, '');
}
