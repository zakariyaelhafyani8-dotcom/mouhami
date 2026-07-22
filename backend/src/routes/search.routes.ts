// Route de recherche intelligente

import { Router } from "express";
import { searchController } from "../controllers/search.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// GET /api/search?q=... — Recherche globale
router.get("/", searchController.search);

export default router;
