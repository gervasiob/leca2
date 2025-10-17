'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Home,
  Menu,
  Users,
  ShoppingCart,
  Factory,
  ClipboardList,
  MessageSquareWarning,
  Settings,
  User,
  List,
  FileText,
  UserCog,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PaintBucketIcon } from '../icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

const navLinks = [
  { href: '/dashboard', icon: Home, label: 'Tablero' },
  { href: '/accounts-receivable', icon: Users, label: 'Cuentas por Cobrar' },
  { href: '/sales/orders', icon: ShoppingCart, label: 'Ventas' },
  { href: '/production/batches', icon: Factory, label: 'Producción' },
  { href: '/dispatch', icon: FileText, label: 'Remitos' },
  { href: '/price-lists', icon: ClipboardList, label: 'Listas de Precios' },
  { href: '/sales/claims', icon: MessageSquareWarning, label: 'Reclamos' },
];

const settingsLinks = [
  { href: '/settings/users', icon: User, label: 'Usuarios' },
  { href: '/settings/roles', icon: UserCog, label: 'Roles y Permisos' },
  { href: '/settings/products', icon: List, label: 'Tablas de Productos' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-30">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <PaintBucketIcon className="h-6 w-6 text-primary" />
          <span className="sr-only">Fábrica de Pintura</span>
        </Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Alternar menú de navegación</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <PaintBucketIcon className="h-6 w-6 text-primary" />
              <span>Fábrica de Pintura</span>
            </Link>
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  pathname.startsWith(href)
                    ? 'text-primary bg-muted'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
             <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="settings" className="border-b-0">
                <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:no-underline">
                   <Settings className="h-5 w-5" />
                   <span>Configuración</span>
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  <nav className="grid gap-2">
                    {settingsLinks.map(({ href, icon: Icon, label }) => (
                       <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                          pathname.startsWith(href)
                            ? 'text-primary bg-muted'
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </Link>
                    ))}
                  </nav>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/user/32/32" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="sr-only">Alternar menú de usuario</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Configuración</DropdownMenuItem>
            <DropdownMenuItem>Soporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
