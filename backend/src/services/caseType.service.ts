import { caseTypeRepository } from "../repositories/caseType.repository";
import { prisma } from "../prisma/client";

export const caseTypeService = {
  async findAll(onlyActive = false) {
    return caseTypeRepository.findAll({ onlyActive });
  },

  async findById(id: string) {
    const caseType = await caseTypeRepository.findById(id);
    if (!caseType) {
      throw { statusCode: 404, message: "نوع القضية غير موجود" };
    }
    return caseType;
  },

  async create(data: { nameAr: string; description?: string }) {
    return caseTypeRepository.create(data);
  },

  async update(id: string, data: { nameAr?: string; description?: string; isActive?: boolean }) {
    const existing = await caseTypeRepository.findById(id);
    if (!existing) {
      throw { statusCode: 404, message: "نوع القضية غير موجود" };
    }
    return caseTypeRepository.update(id, data);
  },

  async delete(id: string) {
    const existing = await caseTypeRepository.findById(id);
    if (!existing) {
      throw { statusCode: 404, message: "نوع القضية غير موجود" };
    }
    return caseTypeRepository.delete(id);
  },

  // ─── CaseType Documents ──────────────────────────────────

  async getDocuments(caseTypeId: string) {
    return prisma.caseTypeDocument.findMany({
      where: { caseTypeId },
      orderBy: { order: "asc" },
    });
  },

  async addDocument(data: { caseTypeId: string; nameAr: string; description?: string; isRequired?: boolean; order?: number }) {
    return prisma.caseTypeDocument.create({ data });
  },

  async updateDocument(id: string, data: { nameAr?: string; description?: string; isRequired?: boolean; order?: number }) {
    return prisma.caseTypeDocument.update({ where: { id }, data });
  },

  async deleteDocument(id: string) {
    return prisma.caseTypeDocument.delete({ where: { id } });
  },
};
