// Fonctions utilitaires génériques

import { v4 as uuidv4 } from "uuid";

// Génère une référence unique pour un dossier
// Format : REF-AAAA-XXXX (ex: REF-2024-0012)
export function generateCaseReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `REF-${year}-${random}`;
}

// Formate une date pour l'affichage
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Slugifie une chaîne (pour les slugs techniques)
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Vérifie qu'un email est valide
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Tronque un texte
export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + "..." : text;
}
