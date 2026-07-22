// Routes des modèles de dossiers (templates)
// Permet de lister et consulter les modèles disponibles

import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { prisma } from "../prisma/client";

const router = Router();

router.use(authenticate);

// GET /api/templates — Liste des modèles
router.get("/", async (_req, res, next) => {
  try {
    const templates = await prisma.caseTemplate.findMany({
      include: {
        documents: { orderBy: { ordre: "asc" } },
        _count: { select: { cases: true } },
      },
      orderBy: { nom: "asc" },
    });
    res.json({ success: true, templates });
  } catch (error) {
    next(error);
  }
});

// GET /api/templates/:id — Détail d'un modèle
router.get("/:id", async (req, res, next) => {
  try {
    const template = await prisma.caseTemplate.findUnique({
      where: { id: req.params.id },
      include: {
        documents: { orderBy: { ordre: "asc" } },
      },
    });
    if (!template) {
      return res.status(404).json({ success: false, message: "النموذج غير موجود" });
    }
    res.json({ success: true, template });
  } catch (error) {
    next(error);
  }
});

export default router;
