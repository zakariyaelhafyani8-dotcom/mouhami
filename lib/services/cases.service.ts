// Service de gestion des dossiers
// Contient la logique métier pour la création, modification, et checklist

import { caseRepository } from "@/lib/repositories/case.repository";
import { activityRepository } from "@/lib/repositories/activity.repository";
import { prisma } from "@/lib/prisma";
import { generateCaseReference } from "@/lib/utils/helpers";

export const casesService = {
  // Liste paginée avec recherche et filtres
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    etat?: string;
    type?: string;
    clientId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const result = await caseRepository.findAll({
      skip,
      take: limit,
      search: params.search,
      etat: params.etat,
      type: params.type,
      clientId: params.clientId,
    });

    return {
      cases: result.cases,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  },

  // Détail d'un dossier
  async findById(id: string) {
    const cas = await caseRepository.findById(id);
    if (!cas) {
      throw { statusCode: 404, message: "الملف غير موجود" };
    }
    return cas;
  },

  // Création d'un dossier avec template et checklist
  async create(data: {
    clientId: string;
    type: string;
    sousType?: string;
    tribunal?: string;
    dateCreation?: Date;
    description?: string;
    notes?: string;
    templateId?: string;
    caseTypeId?: string;
    mahakimRef?: string;
    userId: string;
  }) {
    const reference = generateCaseReference();

    // Utiliser une transaction pour créer le dossier et la checklist
    const cas = await prisma.$transaction(async (tx) => {
      // Créer le dossier
      const newCase = await tx.case.create({
        data: {
          reference,
          clientId: data.clientId,
          type: data.type,
          sousType: data.sousType || undefined,
          tribunal: data.tribunal || undefined,
          dateCreation: data.dateCreation || new Date(),
          description: data.description || undefined,
          notes: data.notes || undefined,
          templateId: data.templateId || undefined,
          caseTypeId: data.caseTypeId || undefined,
          mahakimRef: data.mahakimRef || undefined,
        },
      });

      let checklistDocs: { nom: string; obligatoire: boolean; ordre: number }[] = [];

      // Si un template est spécifié, créer les items de checklist
      if (data.templateId) {
        const templateDocs = await tx.caseTemplateDocument.findMany({
          where: { templateId: data.templateId },
          orderBy: { ordre: "asc" },
        });
        checklistDocs = templateDocs.map((doc) => ({
          nom: doc.nom,
          obligatoire: doc.obligatoire,
          ordre: doc.ordre,
        }));
      }

      // Si un caseTypeId est spécifié, utiliser ses documents obligatoires
      if (data.caseTypeId) {
        const caseTypeDocs = await tx.caseTypeDocument.findMany({
          where: { caseTypeId: data.caseTypeId },
          orderBy: { order: "asc" },
        });
        checklistDocs = caseTypeDocs.map((doc) => ({
          nom: doc.nameAr,
          obligatoire: doc.isRequired,
          ordre: doc.order,
        }));
      }

      if (checklistDocs.length > 0) {
        await tx.caseChecklistItem.createMany({
          data: checklistDocs.map((doc) => ({
            casId: newCase.id,
            nom: doc.nom,
            obligatoire: doc.obligatoire,
            ordre: doc.ordre,
            coche: false,
          })),
        });
      }

      return newCase;
    });

    // Journaliser l'activité
    await activityRepository.create({
      userId: data.userId,
      action: "creation",
      entity: "case",
      entityId: cas.id,
      description: `إنشاء ملف جديد : ${reference} - ${data.type}`,
      casId: cas.id,
    });

    return caseRepository.findById(cas.id);
  },

  // Mise à jour d'un dossier
  async update(id: string, data: any, userId: string) {
    const existing = await caseRepository.findById(id);
    if (!existing) {
      throw { statusCode: 404, message: "الملف غير موجود" };
    }

    // Nettoyer les chaînes vides pour éviter les erreurs UUID/contraintes
    const cleanData = { ...data };
    for (const key of ["templateId", "mahakimRef", "sousType", "tribunal", "description", "notes"]) {
      if (cleanData[key] === "") cleanData[key] = undefined;
    }

    const cas = await caseRepository.update(id, cleanData);

    await activityRepository.create({
      userId,
      action: "modification",
      entity: "case",
      entityId: id,
      description: `تعديل الملف : ${existing.reference}`,
      casId: id,
    });

    return cas;
  },

  // Suppression d'un dossier
  async delete(id: string, userId: string) {
    const existing = await caseRepository.findById(id);
    if (!existing) {
      throw { statusCode: 404, message: "الملف غير موجود" };
    }

    await caseRepository.delete(id);

    await activityRepository.create({
      userId,
      action: "suppression",
      entity: "case",
      entityId: id,
      description: `حذف الملف : ${existing.reference}`,
    });
  },

  // Mettre à jour le statut de la checklist
  async toggleChecklistItem(itemId: string, coche: boolean, userId: string, casId: string) {
    const item = await prisma.caseChecklistItem.update({
      where: { id: itemId },
      data: { coche },
    });

    // Recalculer le pourcentage d'avancement
    const allItems = await prisma.caseChecklistItem.findMany({
      where: { casId },
    });

    const totalItems = allItems.filter((i) => i.obligatoire).length;
    const checkedItems = allItems.filter((i) => i.obligatoire && i.coche).length;
    const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

    await prisma.case.update({
      where: { id: casId },
      data: { progress },
    });

    await activityRepository.create({
      userId,
      action: "modification",
      entity: "case",
      entityId: casId,
      description: `${coche ? "تأكيد" : "إلغاء"} : ${item.nom}`,
      casId,
    });

    return { progress, item };
  },

  // Statistiques des dossiers
  async getStats() {
    const total = await caseRepository.count();
    const byEtat = await caseRepository.countByEtat();
    return { total, byEtat };
  },

  // Export PDF d'un dossier
  async getExportData(id: string) {
    const cas = await this.findById(id);
    if (!cas) throw { statusCode: 404, message: "الملف غير موجود" };

    return {
      reference: cas.reference,
      mahakimRef: cas.mahakimRef || undefined,
      type: cas.type,
      sousType: cas.sousType || undefined,
      tribunal: cas.tribunal || undefined,
      dateCreation: cas.dateCreation.toISOString().split("T")[0],
      etat: cas.etat,
      description: cas.description || undefined,
      notes: cas.notes || undefined,
      progress: cas.progress,
      client: {
        nom: cas.client.nom,
        prenom: cas.client.prenom,
        cin: cas.client.cin,
        telephone: cas.client.telephone,
        adresse: cas.client.adresse || undefined,
        ville: cas.client.ville || undefined,
      },
      documents: cas.documents.map((d) => ({
        nom: d.nom,
        fileName: d.fileName,
        etat: d.etat,
        uploadedAt: d.uploadedAt.toISOString(),
      })),
      hearings: cas.hearings.map((h) => ({
        date: h.date.toISOString(),
        type: h.type || undefined,
        tribunal: h.tribunal || undefined,
        statut: h.statut,
      })),
    };
  },
};
