import { Router } from "express";
import { caseTypeController } from "../controllers/caseType.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// GET /api/case-types — Liste des types d'affaires
router.get("/", caseTypeController.findAll);

// GET /api/case-types/:id — Détail d'un type
router.get("/:id", caseTypeController.findById);

// POST /api/case-types — Créer un type
router.post("/", requireAdmin, caseTypeController.create);

// PUT /api/case-types/:id — Modifier un type
router.put("/:id", requireAdmin, caseTypeController.update);

// DELETE /api/case-types/:id — Supprimer un type
router.delete("/:id", requireAdmin, caseTypeController.delete);

// ─── Documents obligatoires ───────────────────────────────

// GET /api/case-types/:id/documents — Documents requis pour un type
router.get("/:id/documents", caseTypeController.getDocuments);

// POST /api/case-types/:id/documents — Ajouter un document requis
router.post("/:id/documents", requireAdmin, caseTypeController.addDocument);

// PUT /api/case-types/:caseTypeId/documents/:docId — Modifier un document requis
router.put("/:caseTypeId/documents/:docId", requireAdmin, caseTypeController.updateDocument);

// DELETE /api/case-types/:caseTypeId/documents/:docId — Supprimer un document requis
router.delete("/:caseTypeId/documents/:docId", requireAdmin, caseTypeController.deleteDocument);

export default router;
