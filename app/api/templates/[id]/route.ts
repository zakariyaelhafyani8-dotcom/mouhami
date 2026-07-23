import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const template = await prisma.caseTemplate.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { ordre: "asc" } },
      },
    });
    if (!template) {
      return NextResponse.json(
        { success: false, message: "النموذج غير موجود" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
