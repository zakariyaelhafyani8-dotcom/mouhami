// Contrôleur de gestion des clients
// Traite les requêtes HTTP et délègue la logique au service

import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { clientsService } from "../services/clients.service";

export const clientsController = {
  // GET /api/clients/me — Client connecté
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientsService.findByUserId(req.user!.userId);
      res.json({ success: true, client });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/clients/me — Modification limitée par le client
  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const existing = await clientsService.findByUserId(req.user!.userId);
      const client = await clientsService.updateOwn(
        existing.id,
        { telephone: req.body.telephone, adresse: req.body.adresse, ville: req.body.ville },
        req.user!.userId
      );
      res.json({ success: true, client });
    } catch (error) {
      next(error);
    }
  },
  // GET /api/clients
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = req.query;
      const result = await clientsService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/clients/:id
  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientsService.findById(req.params.id);
      res.json({ success: true, client });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/clients
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientsService.create({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json({ success: true, client });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/clients/:id
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientsService.update(
        req.params.id,
        req.body,
        req.user!.userId
      );
      res.json({ success: true, client });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/clients/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await clientsService.delete(req.params.id, req.user!.userId);
      res.json({ success: true, message: "تم حذف العميل بنجاح" });
    } catch (error) {
      next(error);
    }
  },
};
