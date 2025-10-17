import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Registrarse</CardTitle>
        <CardDescription>
          Ingresa tu información para crear una cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full-name">Nombre Completo</Label>
            <Input id="full-name" placeholder="Juan Perez" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" />
          </div>
          <Button type="submit" className="w-full">
            Crear una cuenta
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="underline">
            Iniciar Sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
