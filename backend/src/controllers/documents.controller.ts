// Contrôleur de gestion des documents
// Gère l'upload, le téléchargement et les types de documents

import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { documentsService } from "../services/documents.service";
import path from "path";
import fs from "fs";

export const documentsController = {
  // GET /api/cases/:casId/documents
  async findByCaseId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const documents = await documentsService.findByCaseId(req.params.casId as string);
      res.json({ success: true, documents });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/cases/:casId/documents
  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file as Express.Multer.File;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "يرجى اختيار ملف للرفع",
        });
      }

      const doc = await documentsService.upload({
        casId: req.params.casId as string,
        typeId: req.body.typeId,
        checklistItemId: req.body.checklistItemId || undefined,
        nom: req.body.nom || file.originalname,
        description: req.body.description,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        auteur: `${req.user!.prenom} ${req.user!.nom}`,
        isClientVisible: req.body.isClientVisible === "true",
        userId: req.user!.userId,
      });

      res.status(201).json({ success: true, document: doc });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/documents/:id/download
  async download(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doc = await documentsService.findById(req.params.id as string);
      const filePath = path.resolve(doc.filePath);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "الملف غير موجود على الخادم",
        });
      }

      res.download(filePath, doc.fileName);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/documents/:id
  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doc = await documentsService.findById(req.params.id as string);
      res.json({ success: true, document: doc });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/documents/:id
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doc = await documentsService.update(
        req.params.id as string,
        req.body,
        req.user!.userId
      );
      res.json({ success: true, document: doc });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/documents/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await documentsService.delete(req.params.id as string, req.user!.userId);
      res.json({ success: true, message: "تم حذف المستند بنجاح" });
    } catch (error) {
      next(error);
    }
  },

  // ─── Types de documents ──────────────────────────────────

  // GET /api/document-types
  async findAllTypes(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const types = await documentsService.findAllTypes();
      res.json({ success: true, types });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/document-types
  async createType(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = await documentsService.createType(req.body);
      res.status(201).json({ success: true, type });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/document-types/:id
  async updateType(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = await documentsService.updateType(req.params.id as string, req.body);
      res.json({ success: true, type });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/document-types/:id
  async deleteType(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await documentsService.deleteType(req.params.id as string);
      res.json({ success: true, message: "تم حذف النوع بنجاح" });
    } catch (error) {
      next(error);
    }
  },
};
