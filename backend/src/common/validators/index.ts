export interface ValidationError {
  field: string;
  message: string;
}

export function validateCoordinates(lat: any, lng: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof lat !== 'number' || isNaN(lat)) {
    errors.push({ field: 'latitude', message: 'Latitude must be a valid number' });
  } else if (lat < -90 || lat > 90) {
    errors.push({ field: 'latitude', message: 'Latitude must be between -90 and 90' });
  }

  if (typeof lng !== 'number' || isNaN(lng)) {
    errors.push({ field: 'longitude', message: 'Longitude must be a valid number' });
  } else if (lng < -180 || lng > 180) {
    errors.push({ field: 'longitude', message: 'Longitude must be between -180 and 180' });
  }

  return errors;
}

export function validateString(value: any, fieldName: string, minLength = 1, maxLength = 255): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push({ field: fieldName, message: `${fieldName} is required and must be a string` });
  } else if (value.length < minLength || value.length > maxLength) {
    errors.push({ field: fieldName, message: `${fieldName} length must be between ${minLength} and ${maxLength}` });
  }

  return errors;
}

export function validateBoolean(value: any, fieldName: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof value !== 'boolean') {
    errors.push({ field: fieldName, message: `${fieldName} must be a boolean` });
  }

  return errors;
}
