// Repository pour la table Cases
// Gère les opérations CRUD des dossiers avec leurs relations

import { prisma } from "../prisma/client";

export const caseRepository = {
  // Lister tous les dossiers avec pagination, recherche et filtres
  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    etat?: string;
    type?: string;
    clientId?: string;
  }) {
    const where: any = {};

    if (params.search) {
      const s = params.search;
      where.OR = [
        { reference: { contains: s, mode: "insensitive" } },
        { mahakimRef: { contains: s, mode: "insensitive" } },
        { tribunal: { contains: s, mode: "insensitive" } },
        { type: { contains: s, mode: "insensitive" } },
        { description: { contains: s, mode: "insensitive" } },
        { client: { nom: { contains: s, mode: "insensitive" } } },
        { client: { prenom: { contains: s, mode: "insensitive" } } },
      ];
    }

    if (params.etat) where.etat = params.etat;
    if (params.type) where.type = params.type;
    if (params.clientId) where.clientId = params.clientId;

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { id: true, nom: true, prenom: true, cin: true } },
          _count: { select: { documents: true, hearings: true } },
        },
      }),
      prisma.case.count({ where }),
    ]);

    return { cases, total };
  },

  // Trouver un dossier par ID avec toutes ses relations
  async findById(id: string) {
    return prisma.case.findUnique({
      where: { id },
      include: {
        client: true,
        template: { include: { documents: true } },
        documents: {
          include: { type: true },
          orderBy: { uploadedAt: "desc" },
        },
        checklist: { orderBy: { ordre: "asc" } },
        hearings: { orderBy: { date: "desc" } },
        payments: { orderBy: { date: "desc" } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { nom: true, prenom: true } } },
        },
      },
    });
  },

  // Créer un dossier
  async create(data: {
    reference: string;
    clientId: string;
    type: string;
    sousType?: string;
    tribunal?: string;
    dateCreation: Date;
    description?: string;
    notes?: string;
    templateId?: string;
    mahakimRef?: string;
  }) {
    return prisma.case.create({ data });
  },

  // Mettre à jour un dossier
  async update(id: string, data: any) {
    return prisma.case.update({ where: { id }, data });
  },

  // Supprimer un dossier
  async delete(id: string) {
    return prisma.case.delete({ where: { id } });
  },

  // Compter le nombre total de dossiers
  async count() {
    return prisma.case.count();
  },

  // Compter les dossiers par état
  async countByEtat() {
    const groups = await prisma.case.groupBy({
      by: ["etat"],
      _count: true,
    });
    return groups.reduce(
      (acc, g) => ({ ...acc, [g.etat]: g._count }),
      {} as Record<string, number>
    );
  },
};
