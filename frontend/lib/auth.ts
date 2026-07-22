// Utilitaires d'authentification côté client
// Gère le stockage des tokens et les vérifications de rôle

export interface AuthUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: "admin" | "client";
}

// Vérifie si l'utilisateur est connecté
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
}

// Récupère l'utilisateur stocké
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// Stocke l'utilisateur
export function setStoredUser(user: AuthUser): void {
  localStorage.setItem("user", JSON.stringify(user));
}

// Stocke les tokens après connexion
export function setAuthTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

// Déconnexion
export function clearAuth(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

// Vérifie si l'utilisateur a le rôle admin
export function isAdmin(): boolean {
  const user = getStoredUser();
  return user?.role === "admin";
}
