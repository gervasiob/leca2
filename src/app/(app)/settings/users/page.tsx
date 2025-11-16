'use client';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserRole as UserRoleEnum } from '@prisma/client';

const UI_ROLE_MAP: Record<UserRoleEnum, string> = {
  [UserRoleEnum.Admin]: 'Admin',
  [UserRoleEnum.Sales]: 'Ventas',
  [UserRoleEnum.Production]: 'Producción',
  [UserRoleEnum.Guest]: 'Invitado',
  [UserRoleEnum.System]: 'System',
};

const ENUM_ROLE_MAP: Record<string, UserRoleEnum> = {
  'Admin': UserRoleEnum.Admin,
  'Ventas': UserRoleEnum.Sales,
  'Producción': UserRoleEnum.Production,
  'Invitado': UserRoleEnum.Guest,
  'System': UserRoleEnum.System,
}

const roleVariantMap: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
    'Admin': 'default',
    'Ventas': 'secondary',
    'Producción': 'outline',
    'Invitado': 'outline',
    'System': 'destructive',
  };

const UI_ROLES = ['Admin', 'Ventas', 'Producción', 'Invitado', 'System'];

type UserRow = { id: number; name: string; email: string; role: UserRoleEnum; lastLogin: Date | null };
type UserPricingRow = { userId: number; priceListId: number; specialDiscountPct: number };
type PriceListOption = { id: number; name: string };

export default function UserSettingsPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceLists, setPriceLists] = useState<PriceListOption[]>([]);
  const [userPricing, setUserPricing] = useState<Record<number, UserPricingRow>>({});
 
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await fetch('/api/roles', { credentials: 'include' });
        const data = await res.json();
        if (res.ok && Array.isArray(data?.roles)) {
          const names = data.roles.map((r: any) => String(r.name));
          if (names.length > 0) {
            // We store the English names but will display them in Spanish
            setAvailableRoles(names);
          }
        }
      } catch {
        // fallback to hardcoded roles if API fails
        setAvailableRoles(Object.values(UserRoleEnum));
      }
    };
    loadRoles();
  }, []);

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRoleEnum>(UserRoleEnum.Guest);
  const [editPriceListId, setEditPriceListId] = useState<string>('');
  const [editDiscount, setEditDiscount] = useState<string>('');
 
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch('/api/users', { credentials: 'include' });
        const data = await res.json();
        if (res.ok && Array.isArray(data?.users)) {
          const parsed = data.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role as UserRoleEnum, // role from DB is already the enum value
            lastLogin: u.lastLogin ? new Date(u.lastLogin) : null,
          }));
          setUsers(parsed);
        } else {
          setUsers([]);
        }
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const loadPriceLists = async () => {
      try {
        const res = await fetch('/api/price-lists', { credentials: 'include' });
        const data = await res.json();
        if (res.ok && Array.isArray(data?.priceLists)) {
          setPriceLists(data.priceLists.map((pl: any) => ({ id: pl.id, name: pl.name })));
        }
      } catch {}
    };
    const loadUserPricing = async () => {
      try {
        const res = await fetch('/api/user-pricing', { credentials: 'include' });
        const data = await res.json();
        if (res.ok && Array.isArray(data?.configs)) {
          const map: Record<number, UserPricingRow> = {};
          data.configs.forEach((c: any) => {
            map[c.userId] = { userId: c.userId, priceListId: Number(c.priceListId), specialDiscountPct: Number(c.specialDiscountPct) };
          });
          setUserPricing(map);
        }
      } catch {}
    };
    loadPriceLists();
    loadUserPricing();
  }, []);

  const onEditClick = (user: UserRow) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    const pricing = userPricing[user.id];
    setEditPriceListId(pricing ? String(pricing.priceListId) : (priceLists[0]?.id ? String(priceLists[0].id) : ''));
    setEditDiscount(pricing ? String(pricing.specialDiscountPct) : '0');
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!editUser) return;
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editName, email: editEmail, role: editRole }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || 'Error al actualizar usuario');
      }
      const updated = data.user as { id: number; name: string; email: string; role: UserRoleEnum; lastLogin?: string };
      setUsers(prev => prev.map(u => u.id === editUser.id ? ({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        lastLogin: updated.lastLogin ? new Date(updated.lastLogin) : u.lastLogin,
      }) : u));

      // Update user pricing only for Sales role
      if (editRole === UserRoleEnum.Sales && editPriceListId) {
        const pr = await fetch(`/api/user-pricing/${editUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ priceListId: Number(editPriceListId), specialDiscountPct: Number(editDiscount || '0') }),
        });
        const prData = await pr.json();
        if (!pr.ok || prData?.ok === false) {
          throw new Error(prData?.error || 'Error al actualizar la configuración de precios');
        }
        setUserPricing(prev => ({
          ...prev,
          [editUser.id]: { userId: editUser.id, priceListId: Number(editPriceListId), specialDiscountPct: Number(editDiscount || '0') },
        }));
      }
      setEditOpen(false);
      toast({ title: 'Usuario actualizado', description: `Se guardaron los cambios de ${updated.name}.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'No se pudo actualizar el usuario.' });
    }
  };

  return (
    <>
      <PageHeader
        title="Configuración de Usuarios"
        description="Gestiona los usuarios y sus permisos."
      >
        <Button>Crear Usuario</Button>
      </PageHeader>
      <Card>
        <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Un listado de todos los usuarios de tu cuenta incluyendo su nombre, título, email y rol.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">Cargando usuarios...</div>
            ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Último Inicio de Sesión</TableHead>
                        <TableHead>
                            <span className="sr-only">Acciones</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => {
                      const uiRole = UI_ROLE_MAP[user.role] || user.role;
                      return (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={roleVariantMap[uiRole] || 'default'}>{uiRole}</Badge>
                            </TableCell>
                            <TableCell>{user.lastLogin ? format(user.lastLogin, 'PPP') : '-'}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Alternar menú</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => onEditClick(user)}>Editar</DropdownMenuItem>
                                    <DropdownMenuItem>Eliminar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
            )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Rol</Label>
              <div className="col-span-3">
                <Select value={editRole} onValueChange={(value) => setEditRole(value as UserRoleEnum)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(roleEnum => (
                      <SelectItem key={roleEnum} value={roleEnum}>{UI_ROLE_MAP[roleEnum as UserRoleEnum] || roleEnum}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editRole === UserRoleEnum.Sales && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Lista de Precios</Label>
                  <div className="col-span-3">
                    <Select value={editPriceListId} onValueChange={(value) => setEditPriceListId(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una lista" />
                      </SelectTrigger>
                      <SelectContent>
                        {priceLists.map(pl => (
                          <SelectItem key={pl.id} value={String(pl.id)}>{pl.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discount" className="text-right">Descuento general (%)</Label>
                  <Input id="discount" type="number" min="0" max="100" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)} className="col-span-3" />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={onSaveEdit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
