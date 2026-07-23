import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { searchService } from "@/lib/services/search.service";

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const result = await searchService.search(q);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
