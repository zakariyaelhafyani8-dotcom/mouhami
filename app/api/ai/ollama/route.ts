import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import { ollamaClient } from "@/lib/ai/utils/ollamaClient";

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    const available = await ollamaClient.isAvailable();
    const models = available ? await ollamaClient.listModels() : [];
    return NextResponse.json({
      success: true,
      available,
      models: models.map((m) => m.name),
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
