// Routes des notifications

import { Router } from "express";
import { notificationsController } from "../controllers/notifications.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// GET /api/notifications — Liste des notifications
router.get("/", notificationsController.findAll);

// PUT /api/notifications/:id/read — Marquer comme lue
router.put("/:id/read", notificationsController.markAsRead);

// PUT /api/notifications/read-all — Tout marquer comme lu
router.put("/read-all", notificationsController.markAllAsRead);

export default router;
