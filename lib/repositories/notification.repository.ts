import { prisma } from "@/lib/prisma";

export const notificationRepository = {
  async findByUserId(userId: string, limit: number = 20) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: limit });
  },
  async countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, lu: false } });
  },
  async markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { lu: true } });
  },
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, lu: false }, data: { lu: true } });
  },
  async create(data: { userId: string; titre: string; message: string; type: string; referenceType?: string; referenceId?: string }) {
    return prisma.notification.create({ data });
  },
  async deleteOld() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return prisma.notification.deleteMany({ where: { createdAt: { lt: thirtyDaysAgo } } });
  },
};
