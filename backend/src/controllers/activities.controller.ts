// Contrôleur de l'historique des activités

import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { activityRepository } from "../repositories/activity.repository";

export const activitiesController = {
  // GET /api/activities
  async findRecent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await activityRepository.findRecent(limit);
      res.json({ success: true, activities });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/cases/:casId/activities
  async findByCaseId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const activities = await activityRepository.findByCaseId(req.params.casId);
      res.json({ success: true, activities });
    } catch (error) {
      next(error);
    }
  },
};
