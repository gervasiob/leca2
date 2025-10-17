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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { clients, products, orderDetails } from '@/lib/data';
import type { Client, Product, OrderDetail } from '@/lib/types';
import { ChevronLeft, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    if (selectedProduct && selectedProduct.colors.length > 0) {
      setCurrentItem(prev => ({...prev, color: selectedProduct.colors[0]}));
    } else {
      setCurrentItem(prev => ({...prev, color: ''}));
    }
  }, [selectedProduct]);


  const handleAddItem = () => {
    if (!currentItem.productId || !currentItem.quantity || !currentItem.color) {
        toast({ title: "Error", description: "Please select a product, color, and quantity.", variant: "destructive"});
        return;
    }

    const product = products.find(p => p.id === parseInt(currentItem.productId, 10));
    if (!product) {
        toast({ title: "Error", description: "Product not found.", variant: "destructive"});
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
        toast({ title: "Error", description: "Please select a client.", variant: "destructive"});
        return;
    }
    if(orderItems.length === 0) {
        toast({ title: "Error", description: "Please add at least one item to the order.", variant: "destructive"});
        return;
    }
    toast({ title: "Success!", description: `Order for ${selectedClient.name} created successfully.`});
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
        title="Create New Order"
        description="Select a client and add products to create a new sales order."
      >
        <Button variant="outline" asChild>
            <Link href="/sales/orders">
                <ChevronLeft className='mr-2' />
                Back to Orders
            </Link>
        </Button>
      </PageHeader>
      <div className="grid gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Select the client for this order.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='max-w-md'>
                    <Label htmlFor='client-select'>Client</Label>
                    <Select onValueChange={(value) => setSelectedClient(clients.find(c => c.id === parseInt(value)) || null)}>
                        <SelectTrigger id="client-select">
                            <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map(client => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Add products to the order.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid md:grid-cols-5 gap-4 items-end">
                    <div className='md:col-span-2'>
                        <Label htmlFor='product-select'>Product</Label>
                        <Select value={currentItem.productId} onValueChange={(value) => setCurrentItem({...currentItem, productId: value, color: ''})}>
                            <SelectTrigger id="product-select">
                                <SelectValue placeholder="Select a product"/>
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(product => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                        {product.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor='color-select'>Color</Label>
                        <Select
                            value={currentItem.color}
                            onValueChange={(value) => setCurrentItem({...currentItem, color: value})}
                            disabled={!selectedProduct}
                        >
                            <SelectTrigger id="color-select">
                                <SelectValue placeholder="Select a color"/>
                            </SelectTrigger>
                            <SelectContent>
                                {selectedProduct?.colors.map(color => (
                                    <SelectItem key={color} value={color}>
                                        {color}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                    <div>
                        <Label htmlFor='quantity-input'>Quantity</Label>
                        <Input id='quantity-input' type="number" min="1" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})} />
                    </div>
                    <Button onClick={handleAddItem} className="self-end">
                        <PlusCircle className="mr-2"/>
                        Add Item
                    </Button>
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-[50px]"><span className='sr-only'>Remove</span></TableHead>
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
                                    <TableCell colSpan={6} className="text-center h-24">No items added yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-end gap-4">
                <div className="text-2xl font-bold">
                    Order Total: ${orderTotal.toLocaleString()}
                </div>
                <div className='flex gap-2'>
                    <Button variant="outline" asChild><Link href="/sales/orders">Cancel</Link></Button>
                    <Button onClick={handleSaveOrder}>Save Order</Button>
                </div>
            </CardFooter>
        </Card>
      </div>
    </>
  );
}
