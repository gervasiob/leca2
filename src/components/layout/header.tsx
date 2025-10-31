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
  Building2,
  BarChart3,
  Database,
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
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { normalizeName, ROLE_NAME_MAP } from '@/lib/rbac';

const mainNavLinks = [
  { href: '/dashboard', icon: Home, label: 'Tablero' },
  { href: '/accounts-receivable', icon: Users, label: 'Cuentas por Cobrar' },
];

const salesNavLinks = [
    { href: '/sales/orders', icon: ShoppingCart, label: 'Pedidos' },
    { href: '/sales/clients', icon: Building2, label: 'Clientes' },
    { href: '/sales/claims', icon: MessageSquareWarning, label: 'Reclamos' },
];

const otherNavLinks = [
  { href: '/production/batches', icon: Factory, label: 'Producción' },
  { href: '/dispatch', icon: FileText, label: 'Remitos' },
  { href: '/price-lists', icon: ClipboardList, label: 'Listas de Precios' },
  { href: '/report', icon: BarChart3, label: 'Reportes' },
];

const settingsLinks = [
  { href: '/settings/users', icon: User, label: 'Usuarios' },
  { href: '/settings/roles', icon: UserCog, label: 'Roles y Permisos' },
  { href: '/settings/products', icon: List, label: 'Tablas de Productos' },
  { href: '/dev/db-viewer', icon: Database, label: 'DB Viewer', system: true },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [allowedScreens, setAllowedScreens] = useState<string[] | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const meRes = await fetch('/api/me', { credentials: 'include' });
        const meData = await meRes.json();
        if (!meRes.ok || !meData?.user?.role) {
          setAllowedScreens([]);
          return;
        }
        const enumRole: string = meData.user.role as string;
        const roleName = ROLE_NAME_MAP[enumRole] ?? enumRole;
        const rolesRes = await fetch('/api/roles', { credentials: 'include' });
        const rolesData = await rolesRes.json();
        const role = Array.isArray(rolesData?.roles)
          ? rolesData.roles.find((r: any) => normalizeName(r.name) === normalizeName(roleName))
          : null;
        setAllowedScreens(role?.permissions ?? []);
      } catch {
        setAllowedScreens([]);
      }
    };
    loadPermissions();
  }, []);

  const can = (screen: string) => !!allowedScreens?.includes(screen);

  const renderLink = (href: string, Icon: React.ElementType, label: string) => (
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
  );

  const visibleMainLinks = mainNavLinks.filter(({ label }) => can(label));
  const visibleSalesLinks = salesNavLinks.filter(({ label }) =>
    label === 'Reclamos' ? can('Reclamos') : can('Ventas')
  );
  const visibleOtherLinks = otherNavLinks.filter(({ label }) => {
    if (label === 'Producción') return can('Producción');
    if (label === 'Remitos') return can('Remitos');
    if (label === 'Listas de Precios') return can('Listas de Precios');
  if (label === 'Reportes') return can('Reportes');
    return true;
  });
  const canSettings = can('Configuración');

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch {}

    try {
      document.cookie = 'auth_user=; Max-Age=0; path=/';
    } catch {}

    toast({ title: 'Sesión cerrada', description: 'Has salido de tu cuenta.' });
    router.replace('/login');
    router.refresh();
  };

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
            
            {visibleMainLinks.map(({ href, icon: Icon, label }) => renderLink(href, Icon, label))}
            
            {visibleSalesLinks.length > 0 && (
              <Accordion type="single" collapsible className="w-full" defaultValue={pathname.startsWith('/sales') ? 'sales' : undefined}>
                <AccordionItem value="sales" className="border-b-0">
                  <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:no-underline [&[data-state=open]>svg]:rotate-180">
                     <ShoppingCart className="h-5 w-5" />
                     <span>Ventas</span>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8">
                    <nav className="grid gap-1">
                      {visibleSalesLinks.map(({ href, icon: Icon, label }) => renderLink(href, Icon, label))}
                    </nav>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            
            {visibleOtherLinks.map(({ href, icon: Icon, label }) => renderLink(href, Icon, label))}

          </nav>
          <div className="mt-auto">
            {canSettings && (
             <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="settings" className="border-b-0">
                <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:no-underline">
                   <Settings className="h-5 w-5" />
                   <span>Configuración</span>
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  <nav className="grid gap-2">
                    {settingsLinks.map(({ href, icon: Icon, label, system }) => {
                        if (system && !can('DB Viewer')) return null;
                        return renderLink(href, Icon, label)
                    })}
                  </nav>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            )}
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
