// Service de gestion des clients
// Contient la logique métier pour les opérations sur les clients

import { clientRepository } from "../repositories/client.repository";
import { activityRepository } from "../repositories/activity.repository";
import { prisma } from "../prisma/client";

export const clientsService = {
  // Liste paginée avec recherche
  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const result = await clientRepository.findAll({
      skip,
      take: limit,
      search: params.search,
    });

    return {
      clients: result.clients,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  },

  // Détail d'un client
  async findById(id: string) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw { statusCode: 404, message: "العميل غير موجود" };
    }
    return client;
  },

  // Création d'un client
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
    userId?: string;
  }) {
    const { userId, ...clientData } = data;
    const client = await clientRepository.create(clientData);

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { clientId: client.id },
      });
      await activityRepository.create({
        userId,
        action: "creation",
        entity: "client",
        entityId: client.id,
        description: `إضافة عميل جديد : ${clientData.prenom} ${clientData.nom}`,
      });
    }

    return client;
  },

  // Mise à jour d'un client
  async update(id: string, data: any, userId: string) {
    const existing = await clientRepository.findById(id);
    if (!existing) {
      throw { statusCode: 404, message: "العميل غير موجود" };
    }

    const client = await clientRepository.update(id, data);

    await activityRepository.create({
      userId,
      action: "modification",
      entity: "client",
      entityId: id,
      description: `تعديل بيانات العميل : ${data.prenom || existing.prenom} ${data.nom || existing.nom}`,
    });

    return client;
  },

  // Suppression d'un client
  async delete(id: string, userId: string) {
    const existing = await clientRepository.findById(id);
    if (!existing) {
      throw { statusCode: 404, message: "العميل غير موجود" };
    }

    await clientRepository.delete(id);

    await activityRepository.create({
      userId,
      action: "suppression",
      entity: "client",
      entityId: id,
      description: `حذف العميل : ${existing.prenom} ${existing.nom}`,
    });
  },

  // Trouver un client par userId
  async findByUserId(userId: string) {
    const client = await clientRepository.findByUserId(userId);
    if (!client) {
      throw { statusCode: 404, message: "العميل غير موجود" };
    }
    return client;
  },

  // Mise à jour limitée pour le client lui-même
  async updateOwn(id: string, data: { telephone?: string; adresse?: string; ville?: string }, userId: string) {
    const existing = await clientRepository.findById(id);
    if (!existing) {
      throw { statusCode: 404, message: "العميل غير موجود" };
    }

    // Vérifier que le client appartient bien à l'utilisateur connecté
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.clientId !== id) {
      throw { statusCode: 403, message: "لا يمكنك تعديل بيانات هذا العميل" };
    }

    return clientRepository.update(id, data);
  },

  // Statistiques clients
  async getStats() {
    const total = await clientRepository.count();
    return { total };
  },
};
