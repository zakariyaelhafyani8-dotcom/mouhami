// Service de tableau de bord
// Agrège les données pour l'affichage du dashboard avocat

import { clientRepository } from "@/lib/repositories/client.repository";
import { caseRepository } from "@/lib/repositories/case.repository";
import { documentRepository } from "@/lib/repositories/document.repository";
import { hearingRepository } from "@/lib/repositories/hearing.repository";
import { activityRepository } from "@/lib/repositories/activity.repository";
import { notificationRepository } from "@/lib/repositories/notification.repository";

export const dashboardService = {
  // Récupère toutes les données du dashboard
  async getData(userId: string) {
    const [
      clientsCount,
      casesCount,
      hearingsCount,
      documentsPending,
      recentActivities,
      recentCases,
      upcomingHearings,
      unreadNotifications,
    ] = await Promise.all([
      clientRepository.count(),
      caseRepository.count(),
      hearingRepository.countUpcoming(),
      documentRepository.countPending(),
      activityRepository.findRecent(10),
      caseRepository.findAll({ take: 5 }),
      hearingRepository.findUpcoming(5),
      notificationRepository.countUnread(userId),
    ]);

    const casesByEtat = await caseRepository.countByEtat();

    return {
      stats: {
        clients: clientsCount,
        cases: casesCount,
        hearings: hearingsCount,
        documentsPending,
      },
      casesByEtat,
      recentActivities,
      recentCases: recentCases.cases,
      upcomingHearings,
      notifications: {
        unread: unreadNotifications,
      },
    };
  },
};
