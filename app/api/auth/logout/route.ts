import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { authService } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await authService.logout(user.userId);

    const response = NextResponse.json({ success: true, message: "تم تسجيل الخروج بنجاح" });

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("user");

    return response;
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    const err = error as { message?: string; statusCode?: number };
    return NextResponse.json(
      { success: false, message: err.message || "حدث خطأ" },
      { status: err.statusCode || 500 }
    );
  }
}
