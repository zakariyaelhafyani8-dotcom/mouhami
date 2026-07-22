import { prisma } from "../prisma/client";

export const caseTypeRepository = {
  async findAll(params: { onlyActive?: boolean } = {}) {
    const where = params.onlyActive ? { isActive: true } : {};
    return prisma.caseType.findMany({
      where,
      include: {
        documents: { orderBy: { order: "asc" } },
        _count: { select: { cases: true } },
      },
      orderBy: { nameAr: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.caseType.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { order: "asc" } },
        _count: { select: { cases: true } },
      },
    });
  },

  async create(data: { nameAr: string; description?: string; isActive?: boolean }) {
    return prisma.caseType.create({ data });
  },

  async update(id: string, data: { nameAr?: string; description?: string; isActive?: boolean }) {
    return prisma.caseType.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.caseType.delete({ where: { id } });
  },

  async count() {
    return prisma.caseType.count();
  },
};
