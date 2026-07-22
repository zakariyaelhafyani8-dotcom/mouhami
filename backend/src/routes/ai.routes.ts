import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";
import fs from "fs";
import path from "path";

const router = Router();

router.use(authenticate);

// POST /api/ai/chat — Envoyer une requête à l'IA
router.post("/chat", aiController.chat);

// GET /api/ai/agents — Liste des agents disponibles
router.get("/agents", aiController.listAgents);

// GET /api/ai/ollama — Vérifier le statut d'Ollama
router.get("/ollama", aiController.checkOllama);

// POST /api/ai/legal-search — Recherche dans la bibliothèque juridique
router.post("/legal-search", aiController.legalSearch);

// GET /api/ai/templates — Liste des modèles de documents
router.get("/templates", (_req, res) => {
  const templatesDir = path.resolve(__dirname, "../../document_templates");
  if (!fs.existsSync(templatesDir)) {
    return res.json({ success: true, templates: [] });
  }
  const files = fs.readdirSync(templatesDir).filter(f => f.endsWith(".json"));
  const templates = files.map(f => {
    const content = JSON.parse(fs.readFileSync(path.join(templatesDir, f), "utf8"));
    return content;
  });
  res.json({ success: true, templates });
});

// GET /api/ai/templates/:type — Détail d'un modèle
router.get("/templates/:type", (req, res) => {
  const filePath = path.resolve(__dirname, "../../document_templates/" + req.params.type + ".json");
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "النموذج غير موجود" });
  }
  const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  res.json({ success: true, template: content });
});

export default router;
