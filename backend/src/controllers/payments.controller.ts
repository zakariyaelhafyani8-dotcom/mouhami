// Contrôleur de gestion des paiements

import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../prisma/client";
import { activityRepository } from "../repositories/activity.repository";

export const paymentsController = {
  // GET /api/cases/:casId/payments
  async findByCaseId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payments = await prisma.payment.findMany({
        where: { casId: req.params.casId },
        orderBy: { date: "desc" },
      });
      res.json({ success: true, payments });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/cases/:casId/payments
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payment = await prisma.payment.create({
        data: {
          casId: req.params.casId,
          montant: parseFloat(req.body.montant),
          date: new Date(req.body.date),
          mode: req.body.mode,
          reference: req.body.reference || undefined,
          notes: req.body.notes || undefined,
        },
      });

      await activityRepository.create({
        userId: req.user!.userId,
        action: "creation",
        entity: "payment",
        entityId: payment.id,
        description: `إضافة دفعة : ${payment.montant} درهم`,
        casId: req.params.casId,
      });

      res.status(201).json({ success: true, payment });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/payments/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.payment.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: "تم حذف الدفعة بنجاح" });
    } catch (error) {
      next(error);
    }
  },
};
