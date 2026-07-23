import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/utils/jwt";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  nom: string;
  prenom: string;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request);
  if (!user) {
    throw NextResponse.json(
      { success: false, message: "يرجى تسجيل الدخول أولاً" },
      { status: 401 }
    );
  }
  return user;
}

export function requireAdmin(request: NextRequest): AuthUser {
  const user = requireAuth(request);
  if (user.role !== "admin") {
    throw NextResponse.json(
      { success: false, message: "غير مصرح لك بالوصول إلى هذه الصفحة" },
      { status: 403 }
    );
  }
  return user;
}
