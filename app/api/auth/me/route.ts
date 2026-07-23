import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { userRepository } from "@/lib/repositories/user.repository";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const found = await userRepository.findById(user.userId);
    if (!found) {
      return NextResponse.json(
        { success: false, message: "المستخدم غير موجود" },
        { status: 404 }
      );
    }
    const { password, refreshToken, ...safeUser } = found;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
