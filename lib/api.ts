export const API_BASE = "/api";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

async function refreshToken(): Promise<string | null> {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }

    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function api<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const { requireAuth = true, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOpts.headers as Record<string, string>),
  };

  if (requireAuth) {
    let token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    let res = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOpts,
      headers,
    });

    if (res.status === 401 && requireAuth) {
      const newToken = await refreshToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(`${API_BASE}${endpoint}`, {
          ...fetchOpts,
          headers,
        });
      } else {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return { success: false, message: "انتهت صلاحية الجلسة" };
      }
    }

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "حدث خطأ في الاتصال",
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message: "تعذر الاتصال بالخادم",
    };
  }
}

export const apiService = {
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    api<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    api<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    api<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    api<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    api<T>(endpoint, { ...options, method: "DELETE" }),

  upload: async <T = any>(endpoint: string, formData: FormData) => {
    const token = localStorage.getItem("accessToken");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "حدث خطأ في الرفع" };
      }

      return { success: true, data: data as T };
    } catch {
      return { success: false, message: "تعذر الاتصال بالخادم" };
    }
  },
};
