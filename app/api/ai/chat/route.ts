import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { aiOrchestrator } from "@/lib/ai/services/orchestrator.service";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { type, data } = await request.json();
    const result = await aiOrchestrator.processRequest({
      type,
      userId: user.userId,
      data,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
