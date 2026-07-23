import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    const templates = await prisma.caseTemplate.findMany({
      include: {
        documents: { orderBy: { ordre: "asc" } },
        _count: { select: { cases: true } },
      },
      orderBy: { nom: "asc" },
    });
    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
