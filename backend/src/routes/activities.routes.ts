// Routes de l'historique des activités

import { Router } from "express";
import { activitiesController } from "../controllers/activities.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// GET /api/activities — Activités récentes
router.get("/", activitiesController.findRecent);

// GET /api/cases/:casId/activities — Activités d'un dossier
router.get("/cases/:casId/activities", activitiesController.findByCaseId);

export default router;
