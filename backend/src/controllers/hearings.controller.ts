// Contrôleur de gestion des audiences

import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { hearingRepository } from "../repositories/hearing.repository";
import { activityRepository } from "../repositories/activity.repository";

export const hearingsController = {
  // GET /api/hearings — Toutes les audiences
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const hearings = await hearingRepository.findAll({
        skip: (page - 1) * limit,
        take: limit,
      });
      res.json({ success: true, hearings });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/cases/:casId/hearings
  async findByCaseId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hearings = await hearingRepository.findByCaseId(req.params.casId);
      res.json({ success: true, hearings });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/cases/:casId/hearings
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hearing = await hearingRepository.create({
        casId: req.params.casId,
        date: new Date(req.body.date),
        heure: req.body.heure || undefined,
        type: req.body.type || undefined,
        tribunal: req.body.tribunal || undefined,
        salle: req.body.salle || undefined,
        juge: req.body.juge || undefined,
        notes: req.body.notes || undefined,
      });

      await activityRepository.create({
        userId: req.user!.userId,
        action: "creation",
        entity: "hearing",
        entityId: hearing.id,
        description: `إضافة جلسة : ${new Date(hearing.date).toLocaleDateString("fr-FR")}`,
        casId: req.params.casId,
      });

      res.status(201).json({ success: true, hearing });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/hearings/:id
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hearing = await hearingRepository.update(req.params.id, req.body);

      await activityRepository.create({
        userId: req.user!.userId,
        action: "modification",
        entity: "hearing",
        entityId: hearing.id,
        description: `تعديل الجلسة`,
        casId: hearing.casId,
      });

      res.json({ success: true, hearing });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/hearings/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hearing = await hearingRepository.findById(req.params.id);
      if (!hearing) {
        return res.status(404).json({ success: false, message: "الجلسة غير موجودة" });
      }

      await hearingRepository.delete(req.params.id);

      await activityRepository.create({
        userId: req.user!.userId,
        action: "suppression",
        entity: "hearing",
        entityId: req.params.id,
        description: `حذف جلسة`,
        casId: hearing.casId,
      });

      res.json({ success: true, message: "تم حذف الجلسة بنجاح" });
    } catch (error) {
      next(error);
    }
  },
};
