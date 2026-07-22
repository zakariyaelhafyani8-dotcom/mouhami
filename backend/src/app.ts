// Point d'entrée du backend Express.js
// Configure les middlewares globaux et monte toutes les routes

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middlewares globaux ────────────────────────────────────

// Sécurité : protège contre les attaques HTTP courantes
app.use(helmet({ contentSecurityPolicy: false }));

// CORS : autorise le frontend à communiquer
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Parsing JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques (uploads)
const uploadsDir = path.resolve(__dirname, "../../uploads");
app.use("/uploads", express.static(uploadsDir));
// S'assurer que le dossier uploads existe
import fs from "fs";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Routes ─────────────────────────────────────────────────

import authRoutes from "./routes/auth.routes";
import clientsRoutes from "./routes/clients.routes";
import casesRoutes from "./routes/cases.routes";
import documentsRoutes from "./routes/documents.routes";
import hearingsRoutes from "./routes/hearings.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import searchRoutes from "./routes/search.routes";
import notificationsRoutes from "./routes/notifications.routes";
import activitiesRoutes from "./routes/activities.routes";
import paymentsRoutes from "./routes/payments.routes";
import templatesRoutes from "./routes/templates.routes";
import settingsRoutes from "./routes/settings.routes";
import caseTypeRoutes from "./routes/caseType.routes";
import aiRoutes from "./routes/ai.routes";
import reminderRoutes from "./routes/reminder.routes";
import { documentIndexer } from "./ai/legal-search/documentIndexer";

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api", documentsRoutes);
app.use("/api", hearingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api", paymentsRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/case-types", caseTypeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reminders", reminderRoutes);

// ─── Route santé ────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "ERP Juridique API — fonctionnement normal",
    timestamp: new Date().toISOString(),
  });
});

// ─── Gestion des erreurs ────────────────────────────────────
app.use(errorHandler);

// ─── Indexation au démarrage ─────────────────────────────────
async function startupIndex() {
  try {
    if (documentIndexer.needsReindexing()) {
      console.log("📚 Indexation de la bibliothèque juridique...");
      const result = await documentIndexer.indexAll();
      console.log(
        `📚 Indexation terminée: ${result.indexed} documents, ${result.errors} erreurs`
      );
    } else {
      const chunkCount = documentIndexer.getChunkCount();
      if (chunkCount > 0) {
        console.log(`📚 Bibliothèque juridique déjà indexée: ${chunkCount} passages`);
      }
    }
  } catch (e) {
    console.log("📚 Aucun document à indexer dans la bibliothèque juridique");
  }
}

// ─── Démarrage ──────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║    ERP Juridique — Backend API           ║
  ║    Port : ${PORT}                          ║
  ║    Mode : ${process.env.NODE_ENV || "development"}               ║
  ╚══════════════════════════════════════════╝
  `);
  await startupIndex();
});

export default app;
