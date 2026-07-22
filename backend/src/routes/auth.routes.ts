// Routes d'authentification
// Accessibles sans authentification (sauf /me et /logout)

import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";

const router = Router();

// POST /api/auth/login — Connexion
router.post(
  "/login",
  validate([
    { field: "email", required: true, type: "email" },
    { field: "password", required: true, minLength: 6 },
  ]),
  authController.login
);

// POST /api/auth/register — Inscription avocat
router.post(
  "/register",
  validate([
    { field: "email", required: true, type: "email" },
    { field: "password", required: true, minLength: 6 },
    { field: "nom", required: true },
    { field: "prenom", required: true },
  ]),
  authController.register
);

// POST /api/auth/refresh — Rafraîchir le token
router.post("/refresh", authController.refresh);

// POST /api/auth/logout — Déconnexion
router.post("/logout", authenticate, authController.logout);

// GET /api/auth/me — Profil utilisateur connecté
router.get("/me", authenticate, authController.me);

export default router;
