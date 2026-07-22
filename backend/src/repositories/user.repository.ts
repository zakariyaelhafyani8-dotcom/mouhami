// Repository pour la table Users
// Encapsule toutes les requêtes Prisma liées aux utilisateurs

import { prisma } from "../prisma/client";

export const userRepository = {
  // Trouver un utilisateur par email
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  // Trouver un utilisateur par ID
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  // Créer un nouvel utilisateur
  async create(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
    role: string;
  }) {
    return prisma.user.create({ data });
  },

  // Mettre à jour le refresh token
  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  },

  // Mettre à jour la date de dernière connexion
  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  },

  // Mettre à jour le mot de passe
  async updatePassword(userId: string, newPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  },

  // Lister tous les utilisateurs (avec pagination)
  async findAll(params: { skip?: number; take?: number }) {
    return prisma.user.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
    });
  },
};
