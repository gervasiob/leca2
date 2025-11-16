
'use client';

import { useEffect, useState } from 'react';
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
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';


export default function ProductSettingsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [statuses, setStatuses] = useState<Record<number, 'active' | 'inactive'>>({});
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const meRes = await fetch('/api/me', { credentials: 'include' });
        const meData = await meRes.json().catch(() => ({}));
        const role = meData?.user?.role as string | undefined;
        setIsAdmin(role === 'Admin');
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.ok) {
            setProducts(data.products);
        } else {
          const message = typeof data.error === 'string' ? data.error : 'Error al cargar productos.';
          toast({ title: 'Error', description: message, variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'No se pudieron cargar los productos.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);
  
  const handleOpenDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const colors = formData.get('colors') as string;
    const productData = {
        name: formData.get('name'),
        type: formData.get('type'),
        application: formData.get('application'),
        colors: colors.split(',').map(c => c.trim()).filter(Boolean),
    };

    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        const data = await res.json();
        if (data.ok) {
            if (editingProduct) {
                setProducts(products.map(p => p.id === data.product.id ? data.product : p));
                toast({ title: 'Producto actualizado' });
            } else {
                setProducts([...products, data.product]);
                toast({ title: 'Producto creado' });
            }
            setDialogOpen(false);
            setEditingProduct(null);
        } else {
            const message = typeof data.error === 'string' ? data.error : 'No se pudo guardar el producto.';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        }
    } catch (error) {
        toast({ title: 'Error de red', description: 'No se pudo guardar el producto.', variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
        const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.ok) {
            setProducts(products.map(p => p.id === productId ? { ...p, status: 'inactive' } : p));
            toast({ title: 'Producto marcado como inactivo' });
        } else {
          const message = typeof data.error === 'string' ? data.error : 'No se pudo eliminar el producto.';
          toast({ title: 'Error', description: message, variant: 'destructive' });
        }
    } catch (error) {
        toast({ title: 'Error de red', description: 'No se pudo eliminar el producto.', variant: 'destructive' });
    }
  };

  const handleReactivateProduct = async (productId: number) => {
    try {
        const res = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active' })
        });
        const data = await res.json();
        if (data.ok) {
            setProducts(products.map(p => p.id === productId ? { ...p, status: 'active' } : p));
            toast({ title: 'Producto reactivado' });
        } else {
          const message = typeof data.error === 'string' ? data.error : 'No se pudo reactivar el producto.';
          toast({ title: 'Error', description: message, variant: 'destructive' });
        }
    } catch (error) {
        toast({ title: 'Error de red', description: 'No se pudo reactivar el producto.', variant: 'destructive' });
    }
  };

  return (
    <>
      <PageHeader
        title="Configuración de Productos"
        description="Gestiona las tablas y atributos de los productos."
      >
        <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2" />
            Crear Producto
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
            <CardTitle>Productos</CardTitle>
            <CardDescription>Un listado de todos los productos en tu fábrica.</CardDescription>
            {isAdmin && (
              <div className="mt-2 flex items-center gap-2">
                <Checkbox id="only-active" checked={showOnlyActive} onCheckedChange={(c) => setShowOnlyActive(!!c)} />
                <Label htmlFor="only-active">Solo Activos</Label>
              </div>
            )}
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Aplicación</TableHead>
                        <TableHead>Colores</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>
                            <span className="sr-only">Acciones</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(showOnlyActive ? products.filter(p => p.status === 'active') : products).map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">#{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.type}</TableCell>
                            <TableCell>{product.application}</TableCell>
                            <TableCell>
                                <div className='flex flex-wrap gap-1'>
                                    {product.colors.map(color => (
                                        <Badge key={color} variant="tag">{color}</Badge>
                                    ))}
                                </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={(product.status ?? 'active') === 'active' ? 'default' : 'destructive'}>
                            {(product.status ?? 'active') === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
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
                                      <DropdownMenuItem onClick={() => handleOpenDialog(product)}>Editar</DropdownMenuItem>
                                      {product.status === 'inactive' && (
                                        <DropdownMenuItem onClick={() => handleReactivateProduct(product.id)}>Reactivar</DropdownMenuItem>
                                      )}
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive">
                                            Eliminar
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. Se marcará el producto como inactivo.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                                    Confirmar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                     {products.length === 0 && !loading && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">No se encontraron productos.</TableCell>
                        </TableRow>
                     )}
                </TableBody>
            </Table>
            )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar' : 'Crear'} Producto</DialogTitle>
            <DialogDescription>
                Rellena los detalles del producto a continuación.
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveProduct}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nombre</Label>
                        <Input id="name" name="name" defaultValue={editingProduct?.name} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Tipo</Label>
                        <Input id="type" name="type" defaultValue={editingProduct?.type} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="application" className="text-right">Aplicación</Label>
                        <Input id="application" name="application" defaultValue={editingProduct?.application} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="colors" className="text-right">Colores</Label>
                        <Input id="colors" name="colors" defaultValue={editingProduct?.colors.join(', ')} className="col-span-3" placeholder="Blanco, Rojo, Azul..." required />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">Guardar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
