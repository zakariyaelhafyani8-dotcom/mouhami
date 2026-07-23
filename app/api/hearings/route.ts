import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { hearingRepository } from "@/lib/repositories/hearing.repository";

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const hearings = await hearingRepository.findAll({
      skip: (page - 1) * limit,
      take: limit,
    });
    return NextResponse.json({ success: true, hearings });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
