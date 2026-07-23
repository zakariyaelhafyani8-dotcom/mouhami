import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { clientsService } from "@/lib/services/clients.service";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const client = await clientsService.findByUserId(user.userId);
    return NextResponse.json({ success: true, client });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const existing = await clientsService.findByUserId(user.userId);
    const client = await clientsService.updateOwn(
      existing.id,
      { telephone: body.telephone, adresse: body.adresse, ville: body.ville },
      user.userId
    );
    return NextResponse.json({ success: true, client });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
