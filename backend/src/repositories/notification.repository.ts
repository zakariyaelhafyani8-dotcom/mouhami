// Repository pour la table Notifications
// Gère les notifications utilisateur

import { prisma } from "../prisma/client";

export const notificationRepository = {
  // Lister les notifications d'un utilisateur
  async findByUserId(userId: string, limit: number = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  // Compter les notifications non lues
  async countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, lu: false },
    });
  },

  // Marquer comme lue
  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { lu: true },
    });
  },

  // Marquer toutes comme lues
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, lu: false },
      data: { lu: true },
    });
  },

  // Créer une notification
  async create(data: {
    userId: string;
    titre: string;
    message: string;
    type: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    return prisma.notification.create({ data });
  },

  // Supprimer les anciennes notifications (plus de 30 jours)
  async deleteOld() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return prisma.notification.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });
  },
};
