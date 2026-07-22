// Routes de gestion des documents et types de documents
// Inclut les routes pour l'upload et les types configurables

import { Router } from "express";
import { documentsController } from "../controllers/documents.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

// ─── Documents ─────────────────────────────────────────────

// GET /api/cases/:casId/documents — Documents d'un dossier
router.get("/cases/:casId/documents", authenticate, documentsController.findByCaseId);

// POST /api/cases/:casId/documents — Uploader un document
router.post(
  "/cases/:casId/documents",
  authenticate,
  requireAdmin,
  upload.single("file"),
  documentsController.upload
);

// GET /api/documents/:id — Détail d'un document
router.get("/documents/:id", authenticate, documentsController.findById);

// GET /api/documents/:id/download — Télécharger un document
router.get("/documents/:id/download", authenticate, documentsController.download);

// PUT /api/documents/:id — Modifier un document
router.put("/documents/:id", authenticate, requireAdmin, documentsController.update);

// DELETE /api/documents/:id — Supprimer un document
router.delete("/documents/:id", authenticate, requireAdmin, documentsController.delete);

// ─── Types de documents (configuration) ────────────────────

// GET /api/document-types — Liste des types
router.get("/document-types", authenticate, documentsController.findAllTypes);

// POST /api/document-types — Créer un type
router.post("/document-types", authenticate, requireAdmin, documentsController.createType);

// PUT /api/document-types/:id — Modifier un type
router.put("/document-types/:id", authenticate, requireAdmin, documentsController.updateType);

// DELETE /api/document-types/:id — Supprimer un type
router.delete("/document-types/:id", authenticate, requireAdmin, documentsController.deleteType);

export default router;
