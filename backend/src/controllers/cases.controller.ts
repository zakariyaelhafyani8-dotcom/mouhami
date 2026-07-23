// Contrôleur de gestion des dossiers
// Traite les requêtes HTTP et gère l'export PDF

import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { casesService } from "../services/cases.service";
import { generateCasePDF } from "../utils/pdf";

export const casesController = {
  // GET /api/cases
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, etat, type, clientId } = req.query;
      const result = await casesService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        etat: etat as string,
        type: type as string,
        clientId: clientId as string,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/cases/:id
  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cas = await casesService.findById(req.params.id as string);
      res.json({ success: true, case: cas });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/cases
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cas = await casesService.create({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json({ success: true, case: cas });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/cases/:id
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cas = await casesService.update(
        req.params.id as string,
        req.body,
        req.user!.userId
      );
      res.json({ success: true, case: cas });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/cases/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await casesService.delete(req.params.id as string, req.user!.userId);
      res.json({ success: true, message: "تم حذف الملف بنجاح" });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/cases/:id/checklist/:itemId
  async toggleChecklist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await casesService.toggleChecklistItem(
        req.params.itemId as string,
        req.body.coche,
        req.user!.userId,
        req.params.id as string
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/cases/:id/pdf
  async exportPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await casesService.getExportData(req.params.id as string);
      const pdfBuffer = await generateCasePDF(data);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="case-${data.reference}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  },
};
