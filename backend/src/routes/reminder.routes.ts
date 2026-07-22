import { Router } from "express";
import { reminderController } from "../controllers/reminder.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.get("/next", reminderController.getNext);
router.get("/today", reminderController.getToday);
router.get("/pending", reminderController.getPending);
router.get("/pending/count", reminderController.getPendingCount);
router.post("/", reminderController.create);
router.put("/:id", reminderController.update);
router.delete("/:id", reminderController.remove);
router.post("/:id/dismiss", reminderController.dismiss);

export default router;
