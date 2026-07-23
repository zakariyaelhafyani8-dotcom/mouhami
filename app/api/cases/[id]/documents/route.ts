import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/middlewares/auth";
import { documentsService } from "@/lib/services/documents.service";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const documents = await documentsService.findByCaseId(id);
    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAdmin(request);
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { success: false, message: "يرجى اختيار ملف للرفع" },
        { status: 400 }
      );
    }

    const uploadsDir = path.resolve(UPLOAD_DIR);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, `${Date.now()}-${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    const doc = await documentsService.upload({
      casId: id,
      typeId: formData.get("typeId") as string || undefined,
      checklistItemId: (formData.get("checklistItemId") as string) || undefined,
      nom: (formData.get("nom") as string) || file.name,
      description: (formData.get("description") as string) || undefined,
      fileName: file.name,
      filePath,
      fileSize: file.size,
      auteur: `${user.prenom} ${user.nom}`,
      isClientVisible: formData.get("isClientVisible") === "true",
      userId: user.userId,
    });

    return NextResponse.json({ success: true, document: doc }, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
