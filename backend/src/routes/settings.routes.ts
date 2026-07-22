// Routes des paramètres du cabinet

import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { prisma } from "../prisma/client";

const router = Router();

router.use(authenticate);

// GET /api/settings — Récupérer tous les paramètres
router.get("/", async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { key: "asc" },
    });
    // Retourne un objet clé-valeur
    const settingsMap = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, string>
    );
    res.json({ success: true, settings: settingsMap });
  } catch (error) {
    next(error);
  }
});

// PUT /api/settings — Mettre à jour les paramètres
router.put("/", requireAdmin, async (req, res, next) => {
  try {
    const updates = req.body as Record<string, string>;
    const results = await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );
    res.json({ success: true, message: "تم تحديث الإعدادات بنجاح" });
  } catch (error) {
    next(error);
  }
});

export default router;
