export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Uzbek phone numbers: +998 XX XXX-XX-XX
  return cleaned.length === 12 && cleaned.startsWith('998');
};

export const isValidEmailOrPhone = (value: string): boolean => {
  return isValidEmail(value) || isValidPhone(value);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const isValidPlate = (plate: string): boolean => {
  // Uzbek plate format: 01A123BC
  const uzbekPlateRegex = /^\d{2}[A-Z]\d{3}[A-Z]{2}$/i;
  return uzbekPlateRegex.test(plate.replace(/\s/g, ''));
};

export const isValidYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 1990 && year <= currentYear;
};

export const isValidAccountNumber = (account: string): boolean => {
  return account.replace(/\s/g, '').length >= 16;
};

export const isValidCardNumber = (card: string): boolean => {
  const cleaned = card.replace(/\s/g, '');
  return /^\d{16}$/.test(cleaned);
};
