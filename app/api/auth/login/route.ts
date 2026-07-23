import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }
    const result = await authService.login(email, password);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
