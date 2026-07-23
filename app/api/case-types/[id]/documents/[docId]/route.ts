import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middlewares/auth";
import { caseTypeService } from "@/lib/services/caseType.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    requireAdmin(request);
    const { docId } = await params;
    const body = await request.json();
    const doc = await caseTypeService.updateDocument(docId, body);
    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    requireAdmin(request);
    const { docId } = await params;
    await caseTypeService.deleteDocument(docId);
    return NextResponse.json({ success: true, message: "تم حذف المستند الإلزامي بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
