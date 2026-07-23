import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    let refreshToken: string | undefined;
    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
    } catch {}
    const token = refreshToken || request.cookies.get("refreshToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "رمز التحديث مطلوب" },
        { status: 400 }
      );
    }
    const result = await authService.refresh(token);

    const response = NextResponse.json({ success: true, ...result });

    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("accessToken", result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    response.cookies.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

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
