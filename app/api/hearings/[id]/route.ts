import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middlewares/auth";
import { hearingRepository } from "@/lib/repositories/hearing.repository";
import { activityRepository } from "@/lib/repositories/activity.repository";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const hearing = await hearingRepository.update(id, body);

    await activityRepository.create({
      userId: user.userId,
      action: "modification",
      entity: "hearing",
      entityId: hearing.id,
      description: `تعديل الجلسة`,
      casId: hearing.casId,
    });

    return NextResponse.json({ success: true, hearing });
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
    const hearing = await hearingRepository.findById(id);
    if (!hearing) {
      return NextResponse.json(
        { success: false, message: "الجلسة غير موجودة" },
        { status: 404 }
      );
    }

    await hearingRepository.delete(id);

    await activityRepository.create({
      userId: user.userId,
      action: "suppression",
      entity: "hearing",
      entityId: id,
      description: `حذف جلسة`,
      casId: hearing.casId,
    });

    return NextResponse.json({ success: true, message: "تم حذف الجلسة بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
