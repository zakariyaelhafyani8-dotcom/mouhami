import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middlewares/auth";
import { documentsService } from "@/lib/services/documents.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const type = await documentsService.updateType(id, body);
    return NextResponse.json({ success: true, type });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;
    await documentsService.deleteType(id);
    return NextResponse.json({ success: true, message: "تم حذف النوع بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
