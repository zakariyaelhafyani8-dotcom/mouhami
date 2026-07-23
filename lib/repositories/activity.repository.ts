import { prisma } from "@/lib/prisma";

export const activityRepository = {
  async create(data: { userId: string; action: string; entity: string; entityId?: string; description?: string; metadata?: any; casId?: string }) {
    return prisma.activity.create({ data });
  },
  async findRecent(limit: number = 20) {
    return prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: limit, include: { user: { select: { nom: true, prenom: true } } } });
  },
  async findByCaseId(casId: string, limit: number = 50) {
    return prisma.activity.findMany({ where: { casId }, orderBy: { createdAt: "desc" }, take: limit, include: { user: { select: { nom: true, prenom: true } } } });
  },
  async findByUserId(userId: string, limit: number = 20) {
    return prisma.activity.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: limit });
  },
};
