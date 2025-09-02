"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type User, UserRole } from "@/lib/types"

type Props = {
  onLogin: (user: User) => void
}

/**
 * Simple demo login panel.
 * Important: It always passes a numeric UserRole enum to onLogin (no strings),
 * so role checks like `role === UserRole.KITCHEN` work reliably.
 */
export default function LoginPanel({ onLogin }: Props) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const makeUser = (name: string, role: UserRole): User => {
    // Some apps require more fields; cast to User to avoid type mismatches.
    return { id: crypto.randomUUID(), name, role } as unknown as User
  }

  const demoLogin = (role: UserRole) => {
    const name =
      role === UserRole.ADMIN
        ? "Yönetici"
        : role === UserRole.MANAGER
          ? "Müdür"
          : role === UserRole.CASHIER
            ? "Kasiyer"
            : role === UserRole.WAITER
              ? "Garson"
              : "Mutfak"
    const user = makeUser(name, role)
    onLogin(user)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you'd call your /api/auth/login here and map role to enum.
    // For now, fall back to waiter if unknown.
    const user = makeUser(username || "Kullanıcı", UserRole.WAITER)
    onLogin(user)
  }

  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Giriş Yap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">
              Giriş
            </Button>
          </form>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => demoLogin(UserRole.ADMIN)}>
              Yönetici (Demo)
            </Button>
            <Button variant="outline" onClick={() => demoLogin(UserRole.MANAGER)}>
              Müdür (Demo)
            </Button>
            <Button variant="outline" onClick={() => demoLogin(UserRole.CASHIER)}>
              Kasiyer (Demo)
            </Button>
            <Button variant="outline" onClick={() => demoLogin(UserRole.WAITER)}>
              Garson (Demo)
            </Button>
            <Button variant="default" onClick={() => demoLogin(UserRole.KITCHEN)} className="col-span-2">
              Mutfak (Demo)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
