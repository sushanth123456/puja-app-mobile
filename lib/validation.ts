export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPhone(value: string): boolean {
  return /^\d{10}$/.test(value.trim());
}

export function required(value: string): boolean {
  return value.trim().length > 0;
}

export function validateRequiredFields(fields: Record<string, string>): string[] {
  return Object.entries(fields)
    .filter(([, value]) => !required(value))
    .map(([key]) => key);
}
