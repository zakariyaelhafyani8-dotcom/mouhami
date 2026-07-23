import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { activityRepository } from "@/lib/repositories/activity.repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ casId: string }> }
) {
  try {
    requireAuth(request);
    const { casId } = await params;
    const activities = await activityRepository.findByCaseId(casId);
    return NextResponse.json({ success: true, activities });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
