import { type User, type LoginCredentials, type CreateUserData, UserRole } from "@/lib/types"

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  })
  let json: any = null
  try {
    json = await res.json()
  } catch {
    json = null
  }
  if (!res.ok) throw new Error((json as any)?.error || `Request failed: ${res.status}`)
  return json as T
}

export const authService = {
  // Önce sunucu tarafı /api/auth/login kullanılır; sorun olursa eski liste bazlı fallback çalışır
  async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      const user = await api<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      })
      // client tarafı state ve localStorage senkronu
      try {
        localStorage.setItem("currentUser", JSON.stringify(user))
      } catch {}
      return user
    } catch {
      // Fallback: /api/users üzerinden arama
      try {
        const users = await this.getAllUsers()
        const user = users.find(
          (u) => u.username === credentials.username && u.password === credentials.password && (u as any).isActive !== false,
        )
        if (user) {
          try {
            localStorage.setItem("currentUser", JSON.stringify(user))
          } catch {}
          return user
        }
      } catch {}
      return null
    }
  },

  async getAllUsers(q?: string, role?: UserRole): Promise<User[]> {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (role) params.set("role", role)
    const qs = params.toString()
    return api<User[]>(`/api/users${qs ? `?${qs}` : ""}`)
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      return await api<User>(`/api/users/${id}`)
    } catch {
      return null
    }
  },

  async createUser(userData: CreateUserData): Promise<User> {
    return api<User>("/api/users", { method: "POST", body: JSON.stringify(userData) })
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return api<User>(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(updates) })
  },

  async deleteUser(id: string): Promise<boolean> {
    await api<{ ok: boolean }>(`/api/users/${id}`, { method: "DELETE" })
    return true
  },

  async changePassword(id: string, newPassword: string): Promise<boolean> {
    await this.updateUser(id, { password: newPassword })
    return true
  },
}
