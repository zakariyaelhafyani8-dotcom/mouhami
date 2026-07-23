import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/middlewares/auth";
import { documentsService } from "@/lib/services/documents.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const doc = await documentsService.findById(id);
    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const doc = await documentsService.update(id, body, user.userId);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAdmin(request);
    const { id } = await params;
    await documentsService.delete(id, user.userId);
    return NextResponse.json({ success: true, message: "تم حذف المستند بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
