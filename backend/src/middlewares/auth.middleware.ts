// Middleware d'authentification JWT
// Vérifie la validité du token pour chaque route protégée
// Supporte les rôles admin et client

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

// Interface étendue pour inclure les infos utilisateur dans la requête
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    nom: string;
    prenom: string;
  };
}

// Middleware de base : vérifie que l'utilisateur est authentifié
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "يرجى تسجيل الدخول أولاً",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      nom: decoded.nom,
      prenom: decoded.prenom,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى",
    });
  }
}

// Middleware pour vérifier le rôle admin
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "غير مصرح لك بالوصول إلى هذه الصفحة",
    });
  }
  next();
}

// Middleware optionnel : n'empêche pas l'accès si pas de token
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        nom: decoded.nom,
        prenom: decoded.prenom,
      };
    }
  } catch {
    // Ignorer les erreurs de token
  }
  next();
}
