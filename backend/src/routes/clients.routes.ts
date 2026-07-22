// Routes de gestion des clients
// Toutes les routes nécessitent une authentification

import { Router } from "express";
import { clientsController } from "../controllers/clients.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Toutes les routes nécessitent d'être connecté
router.use(authenticate);

// GET /api/clients/me — Client connecté (AVANT /:id pour éviter conflit)
router.get("/me", clientsController.me);

// PUT /api/clients/me — Modification limitée par le client
router.put("/me", clientsController.updateMe);

// GET /api/clients — Liste des clients
router.get("/", clientsController.findAll);

// GET /api/clients/:id — Détail d'un client
router.get("/:id", clientsController.findById);

// POST /api/clients — Créer un client
router.post("/", requireAdmin, clientsController.create);

// PUT /api/clients/:id — Modifier un client (admin uniquement)
router.put("/:id", requireAdmin, clientsController.update);

// DELETE /api/clients/:id — Supprimer un client
router.delete("/:id", requireAdmin, clientsController.delete);

export default router;
