// Middleware global de gestion des erreurs
// Capture toutes les erreurs non gérées et retourne une réponse formatée
// Gère à la fois les instances d'Error et les objets plats { statusCode, message }

import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || err.message === "" ? err.message : "حدث خطأ غير متوقع";

  console.error(`[ERROR] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    ...(err.details && { details: err.details }),
  });
}
