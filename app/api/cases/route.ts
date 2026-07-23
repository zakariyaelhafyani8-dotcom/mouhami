import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/middlewares/auth";
import { casesService } from "@/lib/services/cases.service";

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const search = searchParams.get("search") || undefined;
    const etat = searchParams.get("etat") || undefined;
    const type = searchParams.get("type") || undefined;
    const clientId = searchParams.get("clientId") || undefined;
    const result = await casesService.findAll({ page, limit, search, etat, type, clientId });
    return NextResponse.json({ success: true, ...result });
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
    const user = requireAdmin(request);
    const body = await request.json();
    const cas = await casesService.create({ ...body, userId: user.userId });
    return NextResponse.json({ success: true, case: cas }, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
