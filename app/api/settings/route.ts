import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    const settings = await prisma.setting.findMany({
      orderBy: { key: "asc" },
    });
    const settingsMap = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, string>
    );
    return NextResponse.json({ success: true, settings: settingsMap });
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
    requireAdmin(request);
    const updates = (await request.json()) as Record<string, string>;
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );
    return NextResponse.json({ success: true, message: "تم تحديث الإعدادات بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
