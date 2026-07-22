// Routes de gestion des dossiers
// Toutes les routes nécessitent une authentification

import { Router } from "express";
import { casesController } from "../controllers/cases.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// GET /api/cases — Liste des dossiers
router.get("/", casesController.findAll);

// GET /api/cases/:id — Détail d'un dossier
router.get("/:id", casesController.findById);

// POST /api/cases — Créer un dossier
router.post("/", requireAdmin, casesController.create);

// PUT /api/cases/:id — Modifier un dossier
router.put("/:id", requireAdmin, casesController.update);

// DELETE /api/cases/:id — Supprimer un dossier
router.delete("/:id", requireAdmin, casesController.delete);

// PATCH /api/cases/:id/checklist/:itemId — Basculer un élément de checklist
router.patch("/:id/checklist/:itemId", requireAdmin, casesController.toggleChecklist);

// GET /api/cases/:id/pdf — Exporter le dossier en PDF
router.get("/:id/pdf", casesController.exportPDF);

export default router;
