'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Select removido para clientes; usamos Combobox con búsqueda
import { clients, products, orderDetails, users } from '@/lib/data';
import type { Client, User } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { ChevronLeft, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '@/components/ui/combobox';

type OrderItem = {
  productId: number;
  productName: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: string;
  application: string;
};

const getProductPrice = (productId: number) => {
    const detail = orderDetails.find(od => od.productId === productId);
    return detail ? detail.unitPrice : 25000;
}

export default function CreateOrderPage() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  const [currentItem, setCurrentItem] = useState<{
    productId: string;
    quantity: string;
    color: string;
  }>({ productId: '', quantity: '1', color: '' });
  
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === parseInt(currentItem.productId, 10));
  }, [currentItem.productId]);

  const productOptions = useMemo(() => {
    return products.map(p => ({ value: p.id.toString(), label: p.name }));
  }, []);

  const colorOptions = useMemo(() => {
    return selectedProduct?.colors.map(c => ({ value: c, label: c })) || [];
  }, [selectedProduct]);

  // Simulación de usuario logueado
  const loggedInUser: User | undefined = users.find(u => u.id === 2); // Ventas
  const isAdmin = loggedInUser?.role === UserRole.Admin;
  const isSystem = loggedInUser?.role === UserRole.System;
  const isSales = loggedInUser?.role === UserRole.Sales;

  const visibleClients: Client[] = useMemo(() => {
    if (isAdmin || isSystem) return clients;
    if (isSales) return clients.filter(c => (c.accessibleUserIds || []).includes(loggedInUser!.id));
    return clients;
  }, [isAdmin, isSystem, isSales]);

  const clientOptions = useMemo(() => {
    return visibleClients.map(c => ({ value: c.id.toString(), label: c.name }));
  }, [visibleClients]);


  useEffect(() => {
    if (selectedProduct && selectedProduct.colors.length > 0 && !selectedProduct.colors.includes(currentItem.color)) {
      setCurrentItem(prev => ({...prev, color: selectedProduct.colors[0]}));
    } else if (!selectedProduct) {
      setCurrentItem(prev => ({...prev, color: ''}));
    }
  }, [selectedProduct, currentItem.color]);


  const handleAddItem = () => {
    if (!currentItem.productId || !currentItem.quantity || !currentItem.color) {
        toast({ title: "Error", description: "Por favor, selecciona un producto, color y cantidad.", variant: "destructive"});
        return;
    }

    const product = products.find(p => p.id === parseInt(currentItem.productId, 10));
    if (!product) {
        toast({ title: "Error", description: "Producto no encontrado.", variant: "destructive"});
        return;
    }
    
    const quantity = parseInt(currentItem.quantity, 10);
    const unitPrice = getProductPrice(product.id);

    const newItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      color: currentItem.color,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      type: product.type,
      application: product.application,
    };

    setOrderItems([...orderItems, newItem]);
    setCurrentItem({ productId: '', quantity: '1', color: '' }); // Reset form
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };
  
  const orderTotal = useMemo(() => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  }, [orderItems]);

  const handleSaveOrder = () => {
    if(!selectedClient) {
        toast({ title: "Error", description: "Por favor, selecciona un cliente.", variant: "destructive"});
        return;
    }
    if(orderItems.length === 0) {
        toast({ title: "Error", description: "Por favor, añade al menos un ítem al pedido.", variant: "destructive"});
        return;
    }
    toast({ title: "¡Éxito!", description: `Pedido para ${selectedClient.name} creado con éxito.`});
    // Here you would typically send data to your backend
    console.log({
        client: selectedClient,
        items: orderItems,
        total: orderTotal
    });
  }

  return (
    <>
      <PageHeader
        title="Crear Nuevo Pedido"
        description="Selecciona un cliente y añade productos para crear un nuevo pedido de venta."
      >
        <Button variant="outline" asChild>
            <Link href="/sales/orders">
                <ChevronLeft className='mr-2' />
                Volver a Pedidos
            </Link>
        </Button>
      </PageHeader>
      <div className="grid gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
                <CardDescription>Selecciona el cliente para este pedido.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='max-w-md'>
                    <Label htmlFor='client-select'>Cliente</Label>
                    <Combobox
                      options={clientOptions}
                      value={selectedClient?.id?.toString() || ''}
                      onChange={(value) => {
                        const client = visibleClients.find(c => c.id === parseInt(value, 10)) || null;
                        setSelectedClient(client);
                      }}
                      placeholder='Selecciona un cliente'
                      searchPlaceholder='Buscar clientes...'
                noResultsMessage='No se encontraron clientes.'
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Ítems del Pedido</CardTitle>
                <CardDescription>Añade productos al pedido.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid md:grid-cols-5 gap-4 items-end">
                    <div className='md:col-span-2'>
                        <Label htmlFor='product-select'>Producto</Label>
                        <Combobox
                            options={productOptions}
                            value={currentItem.productId}
                            onChange={(value) => setCurrentItem({ ...currentItem, productId: value, color: '' })}
                            placeholder='Selecciona un producto'
                            searchPlaceholder='Buscar productos...'
                            noResultsMessage='No se encontraron productos.'
                         />
                    </div>
                     <div>
                        <Label htmlFor='color-select'>Color</Label>
                        <Combobox
                            options={colorOptions}
                            value={currentItem.color}
                            onChange={(value) => setCurrentItem({ ...currentItem, color: value })}
                            placeholder='Selecciona un color'
                            searchPlaceholder='Buscar colores...'
                            noResultsMessage='No se encontraron colores.'
                        />
                     </div>
                    <div>
                        <Label htmlFor='quantity-input'>Cantidad</Label>
                        <Input id='quantity-input' type="number" min="1" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})} />
                    </div>
                    <Button onClick={handleAddItem} className="self-end">
                        <PlusCircle className="mr-2"/>
                        Añadir Ítem
                    </Button>
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead className="text-center">Cantidad</TableHead>
                                <TableHead className="text-right">Precio Unit.</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-[50px]"><span className='sr-only'>Eliminar</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderItems.length > 0 ? orderItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell>{item.color}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${item.unitPrice.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">${item.totalPrice.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Aún no se han añadido ítems.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-end gap-4">
                <div className="text-2xl font-bold">
                    Total del Pedido: ${orderTotal.toLocaleString()}
                </div>
                <div className='flex gap-2'>
                    <Button variant="outline" asChild><Link href="/sales/orders">Cancelar</Link></Button>
                    <Button onClick={handleSaveOrder}>Guardar Pedido</Button>
                </div>
            </CardFooter>
        </Card>
      </div>
    </>
  );
}
