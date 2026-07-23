import { prisma } from "@/lib/prisma";

export const clientRepository = {
  async findAll(params: { skip?: number; take?: number; search?: string }) {
    const where: any = {};
    if (params.search) {
      const s = params.search;
      where.OR = [
        { nom: { contains: s, mode: "insensitive" } },
        { prenom: { contains: s, mode: "insensitive" } },
        { cin: { contains: s, mode: "insensitive" } },
        { telephone: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
      ];
    }
    const [clients, total] = await Promise.all([
      prisma.client.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" }, include: { _count: { select: { cases: true } } } }),
      prisma.client.count({ where }),
    ]);
    return { clients, total };
  },
  async findById(id: string) {
    return prisma.client.findUnique({ where: { id }, include: { cases: { orderBy: { createdAt: "desc" }, include: { _count: { select: { documents: true, hearings: true } } } } } });
  },
  async create(data: { nom: string; prenom: string; cin: string; telephone: string; adresse?: string; ville?: string; profession?: string; email?: string; observations?: string }) {
    return prisma.client.create({ data });
  },
  async update(id: string, data: any) {
    return prisma.client.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.client.delete({ where: { id } });
  },
  async findByUserId(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { client: true } });
    return user?.client || null;
  },
  async count() {
    return prisma.client.count();
  },
};
