import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middlewares/auth";
import { casesService } from "@/lib/services/cases.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const user = requireAdmin(request);
    const { id, itemId } = await params;
    const { coche } = await request.json();
    const result = await casesService.toggleChecklistItem(itemId, coche, user.userId, id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
