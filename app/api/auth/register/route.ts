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
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
