import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { documentsService } from "@/lib/services/documents.service";
import path from "path";
import fs from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const doc = await documentsService.findById(id);
    const filePath = path.resolve(doc.filePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "الملف غير موجود على الخادم" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${doc.fileName}"`,
      },
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
