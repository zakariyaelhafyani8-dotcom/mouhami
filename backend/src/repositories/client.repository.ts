// Repository pour la table Clients
// Gère toutes les opérations CRUD des clients

import { prisma } from "../prisma/client";

export const clientRepository = {
  // Lister tous les clients avec pagination et recherche
  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const where: any = {};

    if (params.search) {
      const s = params.search;
      where.OR = [
        { nom: { contains: s, mode: "insensitive" } },
        { prenom: { contains: s, mode: "insensitive" } },
        { cin: { contains: s, mode: "insensitive" } },
        { telephone: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { cases: true } } },
      }),
      prisma.client.count({ where }),
    ]);

    return { clients, total };
  },

  // Trouver un client par ID
  async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        cases: {
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { documents: true, hearings: true } } },
        },
      },
    });
  },

  // Créer un client
  async create(data: {
    nom: string;
    prenom: string;
    cin: string;
    telephone: string;
    adresse?: string;
    ville?: string;
    profession?: string;
    email?: string;
    observations?: string;
  }) {
    return prisma.client.create({ data });
  },

  // Mettre à jour un client
  async update(id: string, data: any) {
    return prisma.client.update({ where: { id }, data });
  },

  // Supprimer un client
  async delete(id: string) {
    return prisma.client.delete({ where: { id } });
  },

  // Trouver un client par userId (la relation est dans User.clientId)
  async findByUserId(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });
    return user?.client || null;
  },

  // Compter le nombre total de clients
  async count() {
    return prisma.client.count();
  },
};
