// Routes de gestion des paiements

import { Router } from "express";
import { paymentsController } from "../controllers/payments.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// GET /api/cases/:casId/payments — Paiements d'un dossier
router.get("/cases/:casId/payments", authenticate, paymentsController.findByCaseId);

// POST /api/cases/:casId/payments — Créer un paiement
router.post("/cases/:casId/payments", authenticate, requireAdmin, paymentsController.create);

// DELETE /api/payments/:id — Supprimer un paiement
router.delete("/payments/:id", authenticate, requireAdmin, paymentsController.delete);

export default router;
