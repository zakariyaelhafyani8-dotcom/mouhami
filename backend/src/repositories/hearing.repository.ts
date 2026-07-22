// Repository pour la table Hearings
// Gère les audiences

import { prisma } from "../prisma/client";

export const hearingRepository = {
  // Lister toutes les audiences (avec pagination)
  async findAll(params: { skip?: number; take?: number }) {
    return prisma.hearing.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { date: "desc" },
      include: {
        cas: {
          select: {
            reference: true,
            client: { select: { nom: true, prenom: true } },
          },
        },
      },
    });
  },

  // Lister les audiences d'un dossier
  async findByCaseId(casId: string) {
    return prisma.hearing.findMany({
      where: { casId },
      orderBy: { date: "desc" },
    });
  },

  // Trouver une audience par ID
  async findById(id: string) {
    return prisma.hearing.findUnique({ where: { id } });
  },

  // Créer une audience
  async create(data: {
    casId: string;
    date: Date;
    heure?: string;
    type?: string;
    tribunal?: string;
    salle?: string;
    juge?: string;
    notes?: string;
  }) {
    return prisma.hearing.create({ data });
  },

  // Mettre à jour une audience
  async update(id: string, data: any) {
    return prisma.hearing.update({ where: { id }, data });
  },

  // Supprimer une audience
  async delete(id: string) {
    return prisma.hearing.delete({ where: { id } });
  },

  // Compter les audiences à venir
  async countUpcoming() {
    return prisma.hearing.count({
      where: {
        date: { gte: new Date() },
        statut: "planifiee",
      },
    });
  },

  // Récupérer les prochaines audiences
  async findUpcoming(limit: number = 10) {
    return prisma.hearing.findMany({
      where: {
        date: { gte: new Date() },
        statut: "planifiee",
      },
      include: {
        cas: {
          include: { client: { select: { nom: true, prenom: true } } },
        },
      },
      orderBy: { date: "asc" },
      take: limit,
    });
  },
};
