import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middlewares/auth";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    const templatesDir = path.resolve(process.cwd(), "document_templates");
    if (!fs.existsSync(templatesDir)) {
      return NextResponse.json({ success: true, templates: [] });
    }
    const files = fs.readdirSync(templatesDir).filter((f) => f.endsWith(".json"));
    const templates = files.map((f) => {
      const content = JSON.parse(fs.readFileSync(path.join(templatesDir, f), "utf8"));
      return content;
    });
    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
