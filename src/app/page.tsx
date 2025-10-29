import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Factory, BarChart3, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Factory className="h-6 w-6 text-primary" />
          <span className="sr-only">Paint Factory Manager</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Iniciar Sesión
          </Link>
          <Button asChild>
            <Link href="/register">Registrarse</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    Gestiona tu Fábrica de Pintura con Precisión
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Nuestra plataforma integral te ayuda a optimizar la producción, administrar ventas y controlar la calidad, todo en un solo lugar.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">
                      Comenzar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/factory-hero/600/400"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="factory production"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-700">
                  Características Clave
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Todo lo que necesitas para tu operación
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Desde la gestión de producción hasta los reportes de ventas, nuestra herramienta está diseñada para cubrir todas las áreas de tu fábrica.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <Factory className="h-8 w-8 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Producción Eficiente</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Crea y gestiona lotes de producción, asigna recursos y haz seguimiento del progreso en tiempo real.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Users className="h-8 w-8 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Gestión de Ventas</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Controla pedidos, clientes y cuentas por cobrar. Simplifica el proceso de venta de principio a fin.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <BarChart3 className="h-8 w-8 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Reportes Inteligentes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Obtén una visión clara del rendimiento de tu negocio con reportes detallados y personalizables.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Paint Factory Manager. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}