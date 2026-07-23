import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "رمز التحديث مطلوب" },
        { status: 400 }
      );
    }
    const result = await authService.refresh(refreshToken);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
