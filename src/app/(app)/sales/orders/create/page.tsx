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
import { products, orderDetails } from '@/lib/data';
import type { Client } from '@/lib/types';
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

const getFallbackPrice = (productId: number) => {
  const detail = orderDetails.find(od => od.productId === productId);
  return detail ? detail.unitPrice : 25000;
}

export default function CreateOrderPage() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [priceListName, setPriceListName] = useState<string>('');
  const [priceMap, setPriceMap] = useState<Record<number, number>>({});
  const [userDiscountPct, setUserDiscountPct] = useState<number>(0);
  
  const [currentItem, setCurrentItem] = useState<{
    productId: string;
    quantity: string;
    color: string;
  }>({ productId: '', quantity: '1', color: '' });
  
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === parseInt(currentItem.productId, 10));
  }, [currentItem.productId]);

  const productOptions = useMemo(() => {
    // Mostrar solo productos que tengan precio en la lista asignada (si existe)
    const idsWithPrice = new Set<number>(Object.keys(priceMap).map(k => parseInt(k, 10)));
    const base = idsWithPrice.size > 0 ? products.filter(p => idsWithPrice.has(p.id)) : products;
    return base.map(p => ({ value: p.id.toString(), label: p.name }));
  }, [priceMap]);

  const colorOptions = useMemo(() => {
    return selectedProduct?.colors.map(c => ({ value: c, label: c })) || [];
  }, [selectedProduct]);

  const clientOptions = useMemo(() => {
    return clients.map(c => ({ value: c.id.toString(), label: c.name }));
  }, [clients]);


  useEffect(() => {
    if (selectedProduct && selectedProduct.colors.length > 0 && !selectedProduct.colors.includes(currentItem.color)) {
      setCurrentItem(prev => ({...prev, color: selectedProduct.colors[0]}));
    } else if (!selectedProduct) {
      setCurrentItem(prev => ({...prev, color: ''}));
    }
  }, [selectedProduct, currentItem.color]);

  // Cargar configuración de precios del usuario actual
  useEffect(() => {
    const loadUserPricing = async () => {
      try {
        const res = await fetch('/api/user-pricing/me?status=active', { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data?.ok) {
          const pl = data.priceList as { id: number; name: string; prices: Record<number, number> };
          const cfg = data.config as { priceListId: number; specialDiscountPct: number };
          setPriceListName(pl?.name || '');
          setPriceMap(pl?.prices || {});
          setUserDiscountPct(Number(cfg?.specialDiscountPct || 0));
        }
      } catch (e) {
        // Si falla, mantenemos mapa vacío y descuento 0
      }
    };
    loadUserPricing();
  }, []);

  // Cargar clientes accesibles desde backend (filtra por usuario en API)
  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetch('/api/clients', { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data?.ok) {
          setClients(Array.isArray(data.clients) ? data.clients : []);
        }
      } catch {}
    };
    loadClients();
  }, []);


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
    const basePrice = priceMap[product.id] ?? getFallbackPrice(product.id);
    const unitPrice = Math.round(basePrice * (1 - (userDiscountPct || 0) / 100));

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

  const handleSaveOrder = async () => {
    if(!selectedClient) {
        toast({ title: "Error", description: "Por favor, selecciona un cliente.", variant: "destructive"});
        return;
    }
    if(orderItems.length === 0) {
        toast({ title: "Error", description: "Por favor, añade al menos un ítem al pedido.", variant: "destructive"});
        return;
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: selectedClient.id,
          items: orderItems.map(it => ({
            productId: it.productId,
            quantity: it.quantity,
            color: it.color,
            unitPrice: it.unitPrice,
            totalPrice: it.totalPrice,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        toast({ title: '¡Éxito!', description: `Pedido para ${selectedClient.name} creado con éxito.` });
      } else {
        toast({ title: 'Error', description: data?.error || 'No se pudo guardar el pedido.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Error de red al guardar el pedido.', variant: 'destructive' });
    }
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
        {(priceListName || userDiscountPct) && (
          <Card>
            <CardHeader>
              <CardTitle>Precios aplicados</CardTitle>
              <CardDescription>
                {priceListName ? `Lista: ${priceListName}` : 'Lista de precios por defecto'}{userDiscountPct ? ` · Descuento general: ${userDiscountPct}%` : ''}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
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
                        const client = clients.find(c => c.id === parseInt(value, 10)) || null;
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
