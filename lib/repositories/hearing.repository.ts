import { prisma } from "@/lib/prisma";

export const hearingRepository = {
  async findAll(params: { skip?: number; take?: number }) {
    return prisma.hearing.findMany({ skip: params.skip, take: params.take, orderBy: { date: "desc" }, include: { cas: { select: { reference: true, client: { select: { nom: true, prenom: true } } } } } });
  },
  async findByCaseId(casId: string) {
    return prisma.hearing.findMany({ where: { casId }, orderBy: { date: "desc" } });
  },
  async findById(id: string) {
    return prisma.hearing.findUnique({ where: { id } });
  },
  async create(data: { casId: string; date: Date; heure?: string; type?: string; tribunal?: string; salle?: string; juge?: string; notes?: string }) {
    return prisma.hearing.create({ data });
  },
  async update(id: string, data: any) {
    return prisma.hearing.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.hearing.delete({ where: { id } });
  },
  async countUpcoming() {
    return prisma.hearing.count({ where: { date: { gte: new Date() }, statut: "planifiee" } });
  },
  async findUpcoming(limit: number = 10) {
    return prisma.hearing.findMany({ where: { date: { gte: new Date() }, statut: "planifiee" }, include: { cas: { include: { client: { select: { nom: true, prenom: true } } } } }, orderBy: { date: "asc" }, take: limit });
  },
};
