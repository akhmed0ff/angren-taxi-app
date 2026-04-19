/** Returns true if the email address is syntactically valid. */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Returns true if the phone number matches an Uzbekistan mobile format.
 * Accepted formats: +998XXXXXXXXX, 998XXXXXXXXX, 0XXXXXXXXX (9 digits after prefix).
 */
export function validatePhone(phone: string): boolean {
  return /^(\+998|998|0)[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Validates password strength.
 * Returns a translation key if invalid, or null if valid.
 * Rules: min 8 chars, at least one letter and one digit.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'validators.passwordMinLength';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'validators.passwordNeedsLetter';
  }
  if (!/[0-9]/.test(password)) {
    return 'validators.passwordNeedsDigit';
  }
  return null;
}

/**
 * Validates that a required field is not blank.
 * Returns a translation key template if invalid, or null if valid.
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} обязательно`;
  }
  return null;
}
