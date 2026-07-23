import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { notificationRepository } from "@/lib/repositories/notification.repository";

export async function PUT(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await notificationRepository.markAllAsRead(user.userId);
    return NextResponse.json({ success: true, message: "تمت قراءة جميع الإشعارات" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
