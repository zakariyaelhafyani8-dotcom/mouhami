import { prisma } from "@/lib/prisma";

export const searchService = {
  async search(query: string, limit: number = 20) {
    if (!query || query.length < 2) {
      return { clients: [], cases: [], documents: [], caseTypes: [] };
    }

    const searchTerm = query.trim();
    const searchConditions = {
      contains: searchTerm,
      mode: "insensitive" as const,
    };

    const [clients, cases, documents, caseTypes] = await Promise.all([
      // Clients
      prisma.client.findMany({
        where: {
          OR: [
            { nom: searchConditions },
            { prenom: searchConditions },
            { cin: searchConditions },
            { telephone: searchConditions },
            { email: searchConditions },
            { ville: searchConditions },
            { profession: searchConditions },
          ],
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      }),

      // Dossiers
      prisma.case.findMany({
        where: {
          OR: [
            { reference: searchConditions },
            { mahakimRef: searchConditions },
            { tribunal: searchConditions },
            { type: searchConditions },
            { sousType: searchConditions },
            { description: searchConditions },
            { notes: searchConditions },
            { client: { nom: searchConditions } },
            { client: { prenom: searchConditions } },
            // Recherche par nom de type d'affaire
            { caseType: { nameAr: searchConditions } },
          ],
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { nom: true, prenom: true } },
        },
      }),

      // Documents
      prisma.document.findMany({
        where: {
          OR: [
            { nom: searchConditions },
            { description: searchConditions },
            { fileName: searchConditions },
            { auteur: searchConditions },
            { commentaires: searchConditions },
          ],
        },
        take: limit,
        orderBy: { uploadedAt: "desc" },
        include: {
          cas: { select: { reference: true } },
        },
      }),

      // Types d'affaires
      prisma.caseType.findMany({
        where: {
          OR: [
            { nameAr: searchConditions },
            { description: searchConditions },
          ],
        },
        take: limit,
        orderBy: { nameAr: "asc" },
      }),
    ]);

    // Trouver les dossiers avec documents manquants
    const casesWithMissingDocs = await prisma.case.findMany({
      where: {
        checklist: {
          some: {
            obligatoire: true,
            coche: false,
            nom: searchConditions,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, nom: true, prenom: true } },
        _count: { select: { documents: true } },
      },
    });

    return {
      query: searchTerm,
      totalResults: clients.length + cases.length + documents.length + caseTypes.length,
      clients,
      cases,
      documents,
      caseTypes,
      casesWithMissingDocs,
    };
  },
};
