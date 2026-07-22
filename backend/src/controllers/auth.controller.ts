// Contrôleur d'authentification
// Gère les requêtes HTTP pour login, register, refresh, logout

import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { authService } from "../services/auth.service";
import { userRepository } from "../repositories/user.repository";

export const authController = {
  // POST /api/auth/login
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/register
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, nom, prenom, telephone } = req.body;
      const result = await authService.register({
        email,
        password,
        nom,
        prenom,
        telephone,
      });
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/refresh
  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId);
      res.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
      }
      const { password, refreshToken, ...safeUser } = user;
      res.json({ success: true, user: safeUser });
    } catch (error) {
      next(error);
    }
  },
};
