// Route du tableau de bord

import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// GET /api/dashboard — Données du tableau de bord
router.get("/", dashboardController.getData);

export default router;
