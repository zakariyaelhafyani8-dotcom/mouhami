import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { activityRepository } from "@/lib/repositories/activity.repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request);
    const { id } = await params;
    const payments = await prisma.payment.findMany({
      where: { casId: id },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, payments });
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
    const payment = await prisma.payment.create({
      data: {
        casId: id,
        montant: parseFloat(body.montant),
        date: new Date(body.date),
        mode: body.mode,
        reference: body.reference || undefined,
        notes: body.notes || undefined,
      },
    });

    await activityRepository.create({
      userId: user.userId,
      action: "creation",
      entity: "payment",
      entityId: payment.id,
      description: `إضافة دفعة : ${payment.montant} درهم`,
      casId: id,
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
