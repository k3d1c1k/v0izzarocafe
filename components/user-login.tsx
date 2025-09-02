"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type User, UserRole } from "@/lib/types"

interface UserLoginProps {
  onLogin: (user: User) => void
}

export default function UserLogin({ onLogin }: UserLoginProps) {
  const [name, setName] = useState("")
  const [role, setRole] = useState<UserRole>(UserRole.WAITER)

  const handleLogin = () => {
    if (name.trim()) {
      onLogin({
        id: Date.now().toString(),
        name: name.trim(),
        role,
        createdAt: new Date(),
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">IZZARO COFFEE POS Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.WAITER}>Waiter</SelectItem>
                <SelectItem value={UserRole.CASHIER}>Cashier</SelectItem>
                <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={handleLogin} disabled={!name.trim()}>
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
