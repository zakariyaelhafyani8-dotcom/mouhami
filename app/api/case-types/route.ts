import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/middlewares/auth";
import { caseTypeService } from "@/lib/services/caseType.service";

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get("active") === "true";
    const types = await caseTypeService.findAll(onlyActive);
    return NextResponse.json({ success: true, types });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
    const body = await request.json();
    const caseType = await caseTypeService.create(body);
    return NextResponse.json({ success: true, caseType }, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
