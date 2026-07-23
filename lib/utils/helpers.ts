import { v4 as uuidv4 } from "uuid";

export function generateCaseReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `REF-${year}-${random}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + "..." : text;
}
