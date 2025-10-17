'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // En una aplicación real, aquí se crearía el usuario en la base de datos.
    // Por ahora, mostramos una notificación y redirigimos al login.
    toast({
      title: '¡Registro exitoso!',
      description: 'Ahora puedes iniciar sesión con tu nueva cuenta.',
    });
    router.push('/login');
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Registrarse</CardTitle>
        <CardDescription>
          Ingresa tu información para crear una cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister}>
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
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Crear una cuenta
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="underline">
            Iniciar Sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}