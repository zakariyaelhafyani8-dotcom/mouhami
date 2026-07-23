import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { caseTypeService } from "../services/caseType.service";

export const caseTypeController = {
  // GET /api/case-types
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const onlyActive = req.query.active === "true";
      const types = await caseTypeService.findAll(onlyActive);
      res.json({ success: true, types });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/case-types/:id
  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const caseType = await caseTypeService.findById(req.params.id as string);
      res.json({ success: true, caseType });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/case-types
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const caseType = await caseTypeService.create(req.body);
      res.status(201).json({ success: true, caseType });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/case-types/:id
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const caseType = await caseTypeService.update(req.params.id as string, req.body);
      res.json({ success: true, caseType });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/case-types/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await caseTypeService.delete(req.params.id as string);
      res.json({ success: true, message: "تم حذف نوع القضية بنجاح" });
    } catch (error) {
      next(error);
    }
  },

  // ─── Documents obligatoires ───────────────────────────────

  // GET /api/case-types/:id/documents
  async getDocuments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const documents = await caseTypeService.getDocuments(req.params.id as string);
      res.json({ success: true, documents });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/case-types/:id/documents
  async addDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doc = await caseTypeService.addDocument({
        caseTypeId: req.params.id,
        ...req.body,
      });
      res.status(201).json({ success: true, document: doc });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/case-types/:caseTypeId/documents/:docId
  async updateDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doc = await caseTypeService.updateDocument(req.params.docId as string, req.body);
      res.json({ success: true, document: doc });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/case-types/:caseTypeId/documents/:docId
  async deleteDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await caseTypeService.deleteDocument(req.params.docId as string);
      res.json({ success: true, message: "تم حذف المستند الإلزامي بنجاح" });
    } catch (error) {
      next(error);
    }
  },
};
