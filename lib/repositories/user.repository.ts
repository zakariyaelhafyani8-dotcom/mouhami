import { prisma } from "@/lib/prisma";

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  async create(data: { email: string; password: string; nom: string; prenom: string; telephone?: string; role: string }) {
    return prisma.user.create({ data });
  },
  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return prisma.user.update({ where: { id: userId }, data: { refreshToken } });
  },
  async updateLastLogin(userId: string) {
    return prisma.user.update({ where: { id: userId }, data: { lastLogin: new Date() } });
  },
  async updatePassword(userId: string, newPassword: string) {
    return prisma.user.update({ where: { id: userId }, data: { password: newPassword } });
  },
  async findAll(params: { skip?: number; take?: number }) {
    return prisma.user.findMany({ skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } });
  },
};
