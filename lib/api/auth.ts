// =================== TYPES ===================
export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
};

// =================== LOGIN API ===================
export async function loginApi(
  payload: LoginPayload
): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch("http://localhost:8080/login-local", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 🔥 penting agar cookie JWT ikut dikirim
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { error: errText || "Login gagal" };
    }

    // backend akan set cookie, jadi client cukup anggap login berhasil
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Login gagal" };
  }
}

// =================== REGISTER API ===================
export async function registerApi(
  payload: RegisterPayload
): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch("http://localhost:8080/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { error: errText || "Register gagal" };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Register gagal" };
  }
}

// =================== ME API (profil otomatis) ===================
export async function fetchProfile(): Promise<{
  user?: any;
  error?: string;
}> {
  try {
    const res = await fetch("http://localhost:8080/me", {
      method: "GET",
      credentials: "include", // kirim cookie ke backend
    });

    if (!res.ok) {
      const errText = await res.text();
      return { error: errText || "Gagal ambil profil" };
    }

    const data = await res.json();
    return { user: data };
  } catch (err: any) {
    return { error: err.message || "Gagal ambil profil" };
  }
}

// =================== LOGOUT API ===================
export async function logout(): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch("http://localhost:8080/logout", {
      method: "POST",
      credentials: "include", // hapus cookie di backend
    });

    if (!res.ok) {
      const errText = await res.text();
      return { error: errText || "Logout gagal" };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Logout gagal" };
  }
}
