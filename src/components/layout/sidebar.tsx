'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
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
} from 'lucide-react';
import { PaintBucketIcon } from '../icons';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { normalizeName, ROLE_NAME_MAP } from '@/lib/rbac';

const navLinks = [
  { href: '/dashboard', icon: Home, label: 'Tablero' },
  { href: '/accounts-receivable', icon: Users, label: 'Cuentas por Cobrar' },
];

const salesLinks = [
    { href: '/sales/orders', icon: ShoppingCart, label: 'Pedidos' },
    { href: '/sales/clients', icon: Building2, label: 'Clientes' },
    { href: '/sales/claims', icon: MessageSquareWarning, label: 'Reclamos' },
];

const otherLinks = [
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

export function Sidebar() {
  const pathname = usePathname();
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
          ? rolesData.roles.find((r: any) => {
              const dbName = normalizeName(r.name);
              // Match either the enum value (English) or the display name (Spanish)
              return dbName === normalizeName(enumRole) || dbName === normalizeName(roleName);
            })
          : null;
        setAllowedScreens(role?.permissions ?? []);
      } catch {
        setAllowedScreens([]);
      }
    };
    loadPermissions();
  }, []);

  const isSalesActive = pathname.startsWith('/sales');

  const can = (screen: string) => !!allowedScreens?.includes(screen);

  const visibleNavLinks = navLinks.filter(({ label }) => can(label));

  const visibleSalesLinks = salesLinks.filter(({ label }) =>
    label === 'Reclamos' ? can('Reclamos') : can('Ventas')
  );

  const visibleOtherLinks = otherLinks.filter(({ label }) => {
    if (label === 'Producción') return can('Producción');
    if (label === 'Remitos') return can('Remitos');
    if (label === 'Listas de Precios') return can('Listas de Precios');
  if (label === 'Reportes') return can('Reportes');
    return true;
  });

  const canSettings = can('Configuración');

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <PaintBucketIcon className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Fábrica de Pintura</span>
          </Link>

          {visibleNavLinks.map(({ href, icon: Icon, label }) => (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
                    pathname.startsWith(href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ))}

          {visibleSalesLinks.length > 0 && (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isSalesActive ? 'accent' : 'ghost'}
                      size="icon"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span className="sr-only">Ventas</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">Ventas</TooltipContent>
              </Tooltip>
              <DropdownMenuContent side="right" align="start">
                {visibleSalesLinks.map(({ href, icon: Icon, label }) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link href={href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {visibleOtherLinks.map(({ href, icon: Icon, label }) => (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
                    pathname.startsWith(href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          {canSettings && (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Configuración</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">Configuración</TooltipContent>
              </Tooltip>
              <DropdownMenuContent side="right" align="start">
                {settingsLinks.map(({ href, icon: Icon, label, system }) => {
                    if (system && !can('DB Viewer')) return null;
                    return (
                        <DropdownMenuItem key={href} asChild>
                            <Link href={href} className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                            </Link>
                        </DropdownMenuItem>
                    )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
