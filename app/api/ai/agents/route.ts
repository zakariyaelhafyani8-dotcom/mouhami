import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { aiOrchestrator } from "@/lib/ai/services/orchestrator.service";

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    const agents = aiOrchestrator.listAgents();
    return NextResponse.json({ success: true, agents });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
