'use client';

import { useEffect, useMemo, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import type { Client, User } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAccessDialogOpen, setAccessDialogOpen] = useState(false);
  const [accessEditingClient, setAccessEditingClient] = useState<Client | null>(null);
  const [accessSelection, setAccessSelection] = useState<number[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSystem, setIsSystem] = useState(false);
  const [isSales, setIsSales] = useState(false);
  const [isAccessPickerOpen, setAccessPickerOpen] = useState(false);

  const visibleClients: Client[] = useMemo(() => {
    return clients;
  }, [clients]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [meRes, clientsRes, usersRes] = await Promise.all([
          fetch('/api/me', { credentials: 'include' }),
          fetch('/api/clients', { credentials: 'include' }),
          fetch('/api/users', { credentials: 'include' }),
        ]);
        const meData = await meRes.json().catch(() => ({}));
        const role = meData?.user?.role as string | undefined;
        setIsAdmin(role === 'Admin');
        setIsSystem(role === 'System');
        setIsSales(role === 'Sales');
        const clientsData = await clientsRes.json().catch(() => ({}));
        if (clientsRes.ok && clientsData?.ok) setClients(clientsData.clients || []);
        const usersData = await usersRes.json().catch(() => ({}));
        if (usersRes.ok && usersData?.ok) setUsersList(usersData.users || []);
      } catch (e) {
        toast({ title: 'Error', description: 'No se pudo cargar clientes/usuarios', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      if (editingClient) {
        setAccessSelection(editingClient.accessibleUserIds || []);
      } else if (!isDialogOpen) {
        setAccessSelection([]);
      }
    }
  }, [isAdmin, isDialogOpen, editingClient]);

  const handleSaveClient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newClientData = Object.fromEntries(formData.entries());
    const payload = {
      name: String(newClientData.name || ''),
      cuit: String(newClientData.cuit || ''),
      address: String(newClientData.address || ''),
      phone: String(newClientData.phone || ''),
      email: String(newClientData.email || ''),
      discountLevel: Number(newClientData.discountLevel || 1),
      canEditPrices: Boolean(newClientData.canEditPrices === 'on'),
      commissionFee: Number(newClientData.commissionFee || 0),
      sellsOnInstallments: Boolean(newClientData.sellsOnInstallments === 'on'),
      accessibleUserIds: isAdmin ? accessSelection : undefined,
    };

    if (editingClient) {
      // Edit client via backend
      const res = await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setClients(prev => prev.map(c => c.id === editingClient.id ? data.client : c));
        toast({ title: 'Cliente actualizado' });
      } else {
        toast({ title: 'Error', description: data.error || 'No se pudo actualizar', variant: 'destructive' });
      }
    } else {
      // Create client via backend
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setClients(prev => [...prev, data.client]);
        toast({ title: 'Cliente creado' });
      } else {
        toast({ title: 'Error', description: data.error || 'No se pudo crear', variant: 'destructive' });
      }
    }
    setDialogOpen(false);
    setEditingClient(null);
  };

  const openAccessEditor = (client: Client) => {
    setAccessEditingClient(client);
    setAccessSelection(client.accessibleUserIds || []);
    setAccessDialogOpen(true);
  };

  const toggleAccessUser = (userId: number) => {
    setAccessSelection(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleSaveAccess = async () => {
    if (!accessEditingClient) return;
    try {
      const res = await fetch(`/api/clients/${accessEditingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accessibleUserIds: accessSelection }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setClients(prev => prev.map(c => c.id === accessEditingClient.id ? data.client : c));
        toast({ title: 'Acceso actualizado' });
      } else {
        toast({ title: 'Error', description: data?.error || 'No se pudo actualizar el acceso', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Error de red al actualizar acceso', variant: 'destructive' });
    }
    setAccessDialogOpen(false);
    setAccessEditingClient(null);
  };

  const handleDeleteClient = async (clientId: number) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setClients(prev => prev.filter(c => c.id !== clientId));
        toast({ title: 'Cliente eliminado' });
      } else {
        toast({ title: 'Error', description: data?.error || 'No se pudo eliminar', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Error de red al eliminar cliente', variant: 'destructive' });
    }
  };

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gestiona tu cartera de clientes."
      >
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Crear Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Editar' : 'Crear'} Cliente</DialogTitle>
              <DialogDescription>
                {editingClient
                  ? 'Actualiza la información de tu cliente.'
                  : 'Añade un nuevo cliente a tu cartera.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveClient}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input id="name" name="name" defaultValue={editingClient?.name} className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cuit" className="text-right">
                    CUIT
                  </Label>
                  <Input id="cuit" name="cuit" defaultValue={editingClient?.cuit} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Dirección
                  </Label>
                  <Input id="address" name="address" defaultValue={editingClient?.address} className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Teléfono
                  </Label>
                  <Input id="phone" name="phone" defaultValue={editingClient?.phone} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" name="email" type="email" defaultValue={editingClient?.email} className="col-span-3" required />
                </div>
                {isAdmin && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right">Usuarios con acceso</Label>
                    <div className="col-span-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {usersList.filter(u => accessSelection.includes(u.id)).map(u => (
                          <Badge key={u.id} variant="tag">{u.name} ({u.role})</Badge>
                        ))}
                        {accessSelection.length === 0 && (
                          <span className="text-sm text-muted-foreground">Sin usuarios seleccionados</span>
                        )}
                      </div>
                      <Popover open={isAccessPickerOpen} onOpenChange={setAccessPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline">Seleccionar usuarios</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-2">
                          <div className="flex flex-col gap-2 max-h-48 overflow-auto">
                            {usersList.map(u => (
                              <label key={u.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={accessSelection.includes(u.id)}
                                  onChange={() => toggleAccessUser(u.id)}
                                />
                                <span>{u.name} ({u.role})</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Guardar Cliente</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <CardDescription>
            Un listado de todos los clientes en tu cuenta.
            {loading && <span className="ml-2">Cargando...</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>CUIT</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                {isAdmin && (<TableHead>Usuarios con acceso</TableHead>)}
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.cuit}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      {(client.accessibleUserIds || []).length > 0
                        ? (client.accessibleUserIds || [])
                            .map(uid => usersList.find(u => u.id === uid)?.name || `#${uid}`)
                            .join(', ')
                        : '—'}
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Alternar menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setEditingClient(client);
                          setDialogOpen(true);
                        }}>
                          Editar
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClient(client.id)}>
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Editor de acceso integrado en crear/editar. Se eliminó el diálogo separado. */}
    </>
  );
}
