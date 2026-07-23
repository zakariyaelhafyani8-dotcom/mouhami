import { prisma } from "@/lib/prisma";

export const documentRepository = {
  async findByCaseId(casId: string) {
    return prisma.document.findMany({ where: { casId }, include: { type: true }, orderBy: { uploadedAt: "desc" } });
  },
  async findById(id: string) {
    return prisma.document.findUnique({ where: { id }, include: { cas: { select: { reference: true, client: true } } } });
  },
  async create(data: { casId: string; typeId?: string; nom: string; description?: string; fileName: string; filePath: string; fileSize?: number; auteur?: string; isClientVisible?: boolean }) {
    return prisma.document.create({ data });
  },
  async update(id: string, data: any) {
    return prisma.document.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.document.delete({ where: { id } });
  },
  async count() {
    return prisma.document.count();
  },
  async countPending() {
    return prisma.document.count({ where: { etat: "en_attente" } });
  },
};
