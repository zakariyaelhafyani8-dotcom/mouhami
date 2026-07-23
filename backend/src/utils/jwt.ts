// Utilitaires JWT pour la génération et la vérification des tokens
// Utilise jsonwebtoken avec une expiration courte pour l'access token
// et une expiration longue pour le refresh token

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  nom: string;
  prenom: string;
}

// Génère un access token (15 minutes)
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  } as jwt.SignOptions);
}

// Génère un refresh token (7 jours)
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
}

// Vérifie un access token
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

// Vérifie un refresh token
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
