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
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      return verifyAccessToken(token);
    }

    const userId = request.headers.get("x-user-id");
    const email = request.headers.get("x-user-email");
    const role = request.headers.get("x-user-role");
    const nom = request.headers.get("x-user-nom");
    const prenom = request.headers.get("x-user-prenom");

    if (userId && email && role && nom && prenom) {
      return { userId, email, role, nom: decodeURIComponent(nom), prenom: decodeURIComponent(prenom) };
    }

    const accessToken = request.cookies.get("accessToken")?.value;
    if (accessToken) {
      return verifyAccessToken(accessToken);
    }

    return null;
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
