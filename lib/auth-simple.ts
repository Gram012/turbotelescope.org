"use client"

// Simple authentication state management
export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Demo users for authentication
const DEMO_USERS = [
  { id: "1", email: "admin@turbotelescope.org", password: "admin123", name: "Admin", role: "admin" },
  { id: "2", email: "ethan@turbotelescope.org", password: "admin123", name: "Ethan", role: "admin" },
  { id: "3", email: "ethan@turbotelescope.org", password: "admin123", name: "Mandeep", role: "admin" },
]

export class AuthService {
  private static readonly STORAGE_KEY = "adminpro_auth"

  static authenticate(email: string, password: string): User | null {
    const user = DEMO_USERS.find((u) => u.email === email && u.password === password)
    if (user) {
      const authUser = { id: user.id, email: user.email, name: user.name, role: user.role }
      this.setUser(authUser)
      return authUser
    }
    return null
  }

  static setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
    }
  }

  static getUser(): User | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    }
    return null
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  static isAuthenticated(): boolean {
    return this.getUser() !== null
  }
}
