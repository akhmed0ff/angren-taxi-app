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
 * Returns an error message string if invalid, or null if valid.
 * Rules: min 8 chars, at least one letter and one digit.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Пароль должен содержать не менее 8 символов';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Пароль должен содержать хотя бы одну букву';
  }
  if (!/[0-9]/.test(password)) {
    return 'Пароль должен содержать хотя бы одну цифру';
  }
  return null;
}

/**
 * Validates that a required field is not blank.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} обязательно для заполнения`;
  }
  return null;
}
