'use client';

import { useState } from 'react';
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

export default function RolesSettingsPage() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState<{
    name: string;
    permissions: string[];
  }>({ name: '', permissions: [] });

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

  const handleSaveRole = () => {
    if (!roleFormData.name) {
      toast({
        title: 'Error',
        description: 'El nombre del rol es obligatorio.',
        variant: 'destructive',
      });
      return;
    }

    if (editingRole) {
      // Edit existing role
      setRoles(
        roles.map((r) =>
          r.id === editingRole.id ? { ...r, ...roleFormData } : r
        )
      );
      toast({
        title: 'Rol actualizado',
        description: `El rol "${roleFormData.name}" ha sido actualizado.`,
      });
    } else {
      // Create new role
      const newRole: Role = {
        id: Math.max(...roles.map((r) => r.id), 0) + 1,
        name: roleFormData.name,
        permissions: roleFormData.permissions,
      };
      setRoles([...roles, newRole]);
      toast({
        title: 'Rol creado',
        description: `El rol "${roleFormData.name}" ha sido creado.`,
      });
    }
    setDialogOpen(false);
  };

  const handleDeleteRole = (roleId: number) => {
    setRoles(roles.filter((r) => r.id !== roleId));
    toast({
      title: 'Rol eliminado',
      description: 'El rol ha sido eliminado correctamente.',
      variant: 'destructive',
    });
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
            <Button type="submit" onClick={handleSaveRole}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
