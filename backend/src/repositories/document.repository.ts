// Repository pour la table Documents
// Gère les opérations sur les documents uploadés

import { prisma } from "../prisma/client";

export const documentRepository = {
  // Lister les documents d'un dossier
  async findByCaseId(casId: string) {
    return prisma.document.findMany({
      where: { casId },
      include: { type: true },
      orderBy: { uploadedAt: "desc" },
    });
  },

  // Trouver un document par ID
  async findById(id: string) {
    return prisma.document.findUnique({
      where: { id },
      include: { cas: { select: { reference: true, client: true } } },
    });
  },

  // Créer un document
  async create(data: {
    casId: string;
    typeId?: string;
    nom: string;
    description?: string;
    fileName: string;
    filePath: string;
    fileSize?: number;
    auteur?: string;
    isClientVisible?: boolean;
  }) {
    return prisma.document.create({ data });
  },

  // Mettre à jour un document
  async update(id: string, data: any) {
    return prisma.document.update({ where: { id }, data });
  },

  // Supprimer un document
  async delete(id: string) {
    return prisma.document.delete({ where: { id } });
  },

  // Compter les documents
  async count() {
    return prisma.document.count();
  },

  // Compter les documents en attente
  async countPending() {
    return prisma.document.count({
      where: { etat: "en_attente" },
    });
  },
};
