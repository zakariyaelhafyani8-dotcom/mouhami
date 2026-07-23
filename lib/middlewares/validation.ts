interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "email" | "uuid";
  minLength?: number;
  maxLength?: number;
}

export function validateBody(body: Record<string, any>, rules: ValidationRule[]): string[] | null {
  const errors: string[] = [];
  for (const rule of rules) {
    const value = body[rule.field];
    if (rule.required && (value === undefined || value === null || value === "")) {
      errors.push(`${rule.field} مطلوب`);
      continue;
    }
    if (value === undefined || value === null) continue;
    if (rule.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${rule.field} يجب أن يكون بريداً إلكترونياً صحيحاً`);
      }
    }
    if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
      errors.push(`${rule.field} يجب أن يحتوي على ${rule.minLength} أحرف على الأقل`);
    }
    if (rule.maxLength && typeof value === "string" && value.length > rule.maxLength) {
      errors.push(`${rule.field} يجب أن لا يتجاوز ${rule.maxLength} حرفاً`);
    }
  }
  return errors.length > 0 ? errors : null;
}
