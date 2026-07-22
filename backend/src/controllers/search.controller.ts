// Contrôleur de recherche intelligente
// Un seul endpoint qui cherche partout

import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { searchService } from "../services/search.service";

export const searchController = {
  // GET /api/search?q=...
  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const result = await searchService.search(query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
};
