import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { notificationRepository } from "@/lib/repositories/notification.repository";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const notifications = await notificationRepository.findByUserId(user.userId);
    const unread = await notificationRepository.countUnread(user.userId);
    return NextResponse.json({ success: true, notifications, unread });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
