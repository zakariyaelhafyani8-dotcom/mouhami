// Routes de gestion des audiences

import { Router } from "express";
import { hearingsController } from "../controllers/hearings.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// GET /api/hearings — Toutes les audiences
router.get("/hearings", authenticate, hearingsController.findAll);

// GET /api/cases/:casId/hearings — Audiences d'un dossier
router.get("/cases/:casId/hearings", authenticate, hearingsController.findByCaseId);

// POST /api/cases/:casId/hearings — Créer une audience
router.post("/cases/:casId/hearings", authenticate, requireAdmin, hearingsController.create);

// PUT /api/hearings/:id — Modifier une audience
router.put("/hearings/:id", authenticate, requireAdmin, hearingsController.update);

// DELETE /api/hearings/:id — Supprimer une audience
router.delete("/hearings/:id", authenticate, requireAdmin, hearingsController.delete);

export default router;
