// Service de gestion des documents
// Gère l'upload, la visualisation et les types de documents

import { documentRepository } from "../repositories/document.repository";
import { activityRepository } from "../repositories/activity.repository";
import { prisma } from "../prisma/client";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export const documentsService = {
  // Upload d'un nouveau document
  async upload(data: {
    casId: string;
    typeId?: string;
    checklistItemId?: string;
    nom: string;
    description?: string;
    fileName: string;
    filePath: string;
    fileSize?: number;
    auteur?: string;
    isClientVisible?: boolean;
    userId: string;
  }) {
    const { userId, ...docData } = data;
    const doc = await documentRepository.create(docData);

    // Si lié à un élément de checklist, le marquer comme fourni
    if (data.checklistItemId) {
      await prisma.caseChecklistItem.update({
        where: { id: data.checklistItemId },
        data: { coche: true },
      });

      // Recalculer le pourcentage d'avancement
      const allItems = await prisma.caseChecklistItem.findMany({
        where: { casId: data.casId },
      });
      const totalItems = allItems.filter((i) => i.obligatoire).length;
      const checkedItems = allItems.filter((i) => i.obligatoire && i.coche).length;
      const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

      await prisma.case.update({
        where: { id: data.casId },
        data: { progress },
      });
    }

    await activityRepository.create({
      userId,
      action: "upload",
      entity: "document",
      entityId: doc.id,
      description: `رفع مستند : ${docData.nom}`,
      casId: docData.casId,
    });

    return doc;
  },

  // Liste des documents d'un dossier
  async findByCaseId(casId: string) {
    return documentRepository.findByCaseId(casId);
  },

  // Détail d'un document
  async findById(id: string) {
    const doc = await documentRepository.findById(id);
    if (!doc) {
      throw { statusCode: 404, message: "المستند غير موجود" };
    }
    return doc;
  },

  // Mise à jour d'un document
  async update(id: string, data: any, userId: string) {
    const existing = await documentRepository.findById(id);
    if (!existing) {
      throw { statusCode: 404, message: "المستند غير موجود" };
    }

    const doc = await documentRepository.update(id, data);

    await activityRepository.create({
      userId,
      action: "modification",
      entity: "document",
      entityId: id,
      description: `تعديل المستند : ${data.nom || existing.nom}`,
      casId: existing.casId,
    });

    return doc;
  },

  // Suppression d'un document (supprime aussi le fichier)
  async delete(id: string, userId: string) {
    const existing = await documentRepository.findById(id);
    if (!existing) {
      throw { statusCode: 404, message: "المستند غير موجود" };
    }

    // Supprimer le fichier physique
    const filePath = path.resolve(existing.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await documentRepository.delete(id);

    await activityRepository.create({
      userId,
      action: "suppression",
      entity: "document",
      entityId: id,
      description: `حذف المستند : ${existing.nom}`,
      casId: existing.casId,
    });
  },

  // ─── Types de documents ──────────────────────────────────

  // Lister tous les types
  async findAllTypes() {
    return prisma.documentType.findMany({
      orderBy: { nom: "asc" },
    });
  },

  // Créer un type de document
  async createType(data: { nom: string; slug: string; icon?: string }) {
    const existing = await prisma.documentType.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw { statusCode: 409, message: "هذا النوع موجود بالفعل" };
    }
    return prisma.documentType.create({ data });
  },

  // Modifier un type
  async updateType(id: string, data: { nom?: string; icon?: string }) {
    return prisma.documentType.update({ where: { id }, data });
  },

  // Supprimer un type
  async deleteType(id: string) {
    return prisma.documentType.delete({ where: { id } });
  },

  // Statistiques
  async getStats() {
    const total = await documentRepository.count();
    const pending = await documentRepository.countPending();
    return { total, pending };
  },
};
