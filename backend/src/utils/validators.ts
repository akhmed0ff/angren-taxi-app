export function isValidPhone(phone: string): boolean {
  return /^\+?[0-9]{9,15}$/.test(phone.replace(/\s/g, ''));
}

export function isValidUserType(type: string): type is 'passenger' | 'driver' {
  return type === 'passenger' || type === 'driver';
}

export function isValidCategory(category: string): category is 'economy' | 'comfort' | 'premium' {
  return ['economy', 'comfort', 'premium'].includes(category);
}

export function isValidPaymentMethod(method: string): method is 'cash' | 'card' {
  return method === 'cash' || method === 'card';
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\s/g, '');
}
