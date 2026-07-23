import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { dashboardService } from "@/lib/services/dashboard.service";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const data = await dashboardService.getData(user.userId);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
