// Contrôleur du tableau de bord
// Agrège toutes les statistiques

import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  // GET /api/dashboard
  async getData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getData(req.user!.userId);
      res.json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  },
};
