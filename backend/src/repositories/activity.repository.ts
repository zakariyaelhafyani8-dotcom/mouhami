// Repository pour la table Activities (historique)
// Enregistre et consulte l'historique des actions

import { prisma } from "../prisma/client";

export const activityRepository = {
  // Créer une activité
  async create(data: {
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    description?: string;
    metadata?: any;
    casId?: string;
  }) {
    return prisma.activity.create({ data });
  },

  // Liste des activités récentes
  async findRecent(limit: number = 20) {
    return prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { nom: true, prenom: true } },
      },
    });
  },

  // Activités pour un dossier spécifique
  async findByCaseId(casId: string, limit: number = 50) {
    return prisma.activity.findMany({
      where: { casId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { nom: true, prenom: true } },
      },
    });
  },

  // Activités pour un utilisateur spécifique
  async findByUserId(userId: string, limit: number = 20) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
