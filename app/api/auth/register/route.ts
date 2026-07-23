import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const { email, password, nom, prenom, telephone } = await request.json();
    if (!email || !password || !nom || !prenom) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني، كلمة المرور، الاسم واللقب مطلوبون" },
        { status: 400 }
      );
    }
    const result = await authService.register({ email, password, nom, prenom, telephone });

    const response = NextResponse.json({ success: true, ...result }, { status: 201 });

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

    response.cookies.set("user", JSON.stringify(result.user), {
      httpOnly: false,
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
