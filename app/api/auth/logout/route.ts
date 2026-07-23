import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { authService } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await authService.logout(user.userId);
    return NextResponse.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
