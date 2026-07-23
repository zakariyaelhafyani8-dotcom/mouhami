import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { reminderService } from "@/lib/services/reminder.service";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const count = await reminderService.getPendingCount(user.userId);
    return NextResponse.json({ success: true, data: { count } });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
