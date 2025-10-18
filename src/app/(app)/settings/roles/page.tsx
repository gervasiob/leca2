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
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { roles as initialRoles, screens } from '@/lib/data';
import type { Role } from '@/lib/types';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export default function RolesSettingsPage() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState<{
    name: string;
    permissions: string[];
  }>({ name: '', permissions: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await fetch('/api/roles', { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data?.roles) {
          setRoles(data.roles);
        } else {
          toast({
            title: 'Error',
            description: data?.error ?? 'No se pudieron cargar los roles.',
            variant: 'destructive',
          });
        }
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e?.message ?? 'Error de red al cargar roles.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  const handleOpenDialog = (role: Role | null = null) => {
    if (role) {
      setEditingRole(role);
      setRoleFormData({ name: role.name, permissions: [...role.permissions] });
    } else {
      setEditingRole(null);
      setRoleFormData({ name: '', permissions: [] });
    }
    setDialogOpen(true);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setRoleFormData((prev) => {
      const newPermissions = checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter((p) => p !== permission);
      return { ...prev, permissions: newPermissions };
    });
  };

  const normalizeName = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

  const handleSaveRole = async () => {
    if (!roleFormData.name) {
      toast({
        title: 'Error',
        description: 'El nombre del rol es obligatorio.',
        variant: 'destructive',
      });
      return;
    }

    // Validación de duplicados (case/diacríticos-insensitive)
    const nameNorm = normalizeName(roleFormData.name);
    const exists = roles.some((r) => normalizeName(r.name) === nameNorm);
    const isSameAsEditing = editingRole && normalizeName(editingRole.name) === nameNorm;
    if (exists && !isSameAsEditing) {
      toast({
        title: 'Nombre duplicado',
        description: 'Ya existe un rol con ese nombre.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingRole) {
        const res = await fetch(`/api/roles/${editingRole.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(roleFormData),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error ?? 'No se pudo actualizar el rol.');
        }
        const updated = data.role as Role;
        setRoles(roles.map((r) => (r.id === updated.id ? updated : r)));
        toast({
          title: 'Rol actualizado',
          description: `El rol "${updated.name}" ha sido actualizado.`,
        });
      } else {
        const res = await fetch('/api/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(roleFormData),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error ?? 'No se pudo crear el rol.');
        }
        const created = data.role as Role;
        setRoles([...roles, created]);
        toast({
          title: 'Rol creado',
          description: `El rol "${created.name}" ha sido creado.`,
        });
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message ?? 'Operación fallida.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? 'No se pudo eliminar el rol.');
      }
      setRoles(roles.filter((r) => r.id !== roleId));
      toast({
        title: 'Rol eliminado',
        description: 'El rol ha sido eliminado correctamente.',
        variant: 'destructive',
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message ?? 'No se pudo eliminar el rol.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Roles y Permisos"
        description="Gestiona los roles de usuario y a qué pantallas pueden acceder."
      >
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2" />
          Crear Rol
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Permisos</CardTitle>
          <CardDescription>
            Define el acceso a cada pantalla para los diferentes roles de
            usuario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-muted-foreground">Cargando roles...</div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Rol</TableHead>
                    {screens.map((screen) => (
                      <TableHead key={screen} className="text-center">
                        {screen}
                      </TableHead>
                    ))}
                    <TableHead className="w-[50px]">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      {screens.map((screen) => (
                        <TableCell key={screen} className="text-center">
                          <Checkbox
                            checked={role.permissions.includes(screen)}
                            aria-label={`Permiso para ${screen}`}
                          />
                        </TableCell>
                      ))}
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
                            <DropdownMenuItem onClick={() => handleOpenDialog(role)}>
                              Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive"
                                >
                                  Eliminar
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el rol.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteRole(role.id)}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Modifica el nombre y los permisos para este rol.'
                : 'Define el nombre y los permisos para el nuevo rol.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="role-name"
                value={roleFormData.name}
                onChange={(e) =>
                  setRoleFormData({ ...roleFormData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Permisos</Label>
              <div className="col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4 rounded-lg border p-4">
                {screens.map((screen) => (
                  <div key={screen} className="flex items-center space-x-2">
                    <Checkbox
                      id={`perm-${screen}`}
                      checked={roleFormData.permissions.includes(screen)}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(screen, !!checked)
                      }
                    />
                    <label
                      htmlFor={`perm-${screen}`}
                      className="text-sm font-medium leading-none"
                    >
                      {screen}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveRole} disabled={saving}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
