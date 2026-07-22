// Middleware de validation des données entrantes
// Vérifie que les champs requis sont présents avant de passer au controller

import { Request, Response, NextFunction } from "express";

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "email" | "uuid";
  minLength?: number;
  maxLength?: number;
}

// Valide un ensemble de champs dans le body de la requête
export function validate(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      // Vérification présence
      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(`${rule.field} مطلوب`);
        continue;
      }

      if (value === undefined || value === null) continue;

      // Vérification type
      if (rule.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${rule.field} يجب أن يكون بريداً إلكترونياً صحيحاً`);
        }
      }

      // Vérification longueur
      if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
        errors.push(`${rule.field} يجب أن يحتوي على ${rule.minLength} أحرف على الأقل`);
      }

      if (rule.maxLength && typeof value === "string" && value.length > rule.maxLength) {
        errors.push(`${rule.field} يجب أن لا يتجاوز ${rule.maxLength} حرفاً`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "خطأ في البيانات المدخلة",
        errors,
      });
    }

    next();
  };
}
