import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/middlewares/auth";
import { hearingRepository } from "@/lib/repositories/hearing.repository";
import { activityRepository } from "@/lib/repositories/activity.repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const hearings = await hearingRepository.findByCaseId(id);
    return NextResponse.json({ success: true, hearings });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const hearing = await hearingRepository.create({
      casId: id,
      date: new Date(body.date),
      heure: body.heure || undefined,
      type: body.type || undefined,
      tribunal: body.tribunal || undefined,
      salle: body.salle || undefined,
      juge: body.juge || undefined,
      notes: body.notes || undefined,
    });

    await activityRepository.create({
      userId: user.userId,
      action: "creation",
      entity: "hearing",
      entityId: hearing.id,
      description: `إضافة جلسة : ${new Date(hearing.date).toLocaleDateString("fr-FR")}`,
      casId: id,
    });

    return NextResponse.json({ success: true, hearing }, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
