'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { orders, orderDetails, clients } from '@/lib/data';
import type { OrderDetail } from '@/lib/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { PaintBucketIcon } from '@/components/icons';
import { Printer, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function GeneratePartialRemitoPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.orderId as string, 10);

  const order = useMemo(() => orders.find((o) => o.id === orderId), [orderId]);
  const client = useMemo(() => clients.find((c) => c.id === order?.clientId), [order]);
  const allProducedItems = useMemo(() => orderDetails.filter((od) => od.orderId === orderId && od.status === 'produced'), [orderId]);
  
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set(allProducedItems.map(item => item.id)));

  if (!order || !client) {
    notFound();
  }
  
  const itemsToDispatch = useMemo(() => {
    return allProducedItems.filter(item => selectedItems.has(item.id));
  }, [selectedItems, allProducedItems]);


  const handlePrint = () => {
    if (itemsToDispatch.length > 0) {
      window.print();
    }
  };
  
  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === allProducedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allProducedItems.map(item => item.id)));
    }
  };


  return (
    <>
      <div className="no-print mb-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Generar Remito Parcial</h1>
            <div className='flex gap-2'>
               <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
                <Button onClick={handlePrint} disabled={itemsToDispatch.length === 0}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir / Guardar PDF
                </Button>
            </div>
        </div>
        <Card className="mt-4">
            <CardHeader>
                <h2 className="text-lg font-semibold">Seleccionar Ítems para el Remito</h2>
                <p className="text-sm text-muted-foreground">Elige los ítems producidos que deseas incluir en este remito parcial.</p>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedItems.size > 0 && selectedItems.size === allProducedItems.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allProducedItems.map(item => (
                             <TableRow key={item.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedItems.has(item.id)}
                                        onCheckedChange={() => toggleSelectItem(item.id)}
                                    />
                                </TableCell>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>{item.color}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                             </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
      
      {itemsToDispatch.length > 0 ? (
        <Card className="printable-area max-w-4xl mx-auto" id="remito-content">
            <CardHeader className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <PaintBucketIcon className="h-10 w-10 text-primary" />
                            <div>
                                <h2 className="text-2xl font-bold">Fábrica de Pinturas S.A.</h2>
                                <p className="text-sm text-muted-foreground">Av. Industrial 123, Parque Industrial, Ciudad</p>
                            </div>
                        </div>
                        <div className="text-sm">
                            <p><strong>CUIT:</strong> 30-98765432-1</p>
                            <p><strong>Email:</strong> ventas@fabrica-pinturas.com</p>
                            <p><strong>Tel:</strong> (011) 4567-8901</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-primary">REMITO (PARCIAL)</h1>
                        <p className="font-semibold">N° 0001-00001235</p>
                        <p className="mt-2"><strong>Fecha:</strong> {format(new Date(), 'dd/MM/yyyy')}</p>
                        <p><strong>Pedido N°:</strong> {order.id}</p>
                    </div>
                </div>
              <Separator className="my-4" />
               <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                       <h3 className="font-semibold mb-1">Cliente:</h3>
                       <p><strong>Razón Social:</strong> {client.name}</p>
                       <p><strong>CUIT:</strong> {client.cuit}</p>
                       <p><strong>Dirección:</strong> {client.address}</p>
                   </div>
                    <div>
                       <h3 className="font-semibold mb-1">Datos de Envío:</h3>
                       <p><strong>Transporte:</strong> A convenir</p>
                       <p><strong>Dirección de Entrega:</strong> {client.address}</p>
                   </div>
               </div>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsToDispatch.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>P-{item.productId}</TableCell>
                      <TableCell>{item.productName} - {item.color}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="p-6 text-sm">
               <div className="w-full space-y-8">
                <div className="flex justify-between items-end">
                    <div className='w-1/2'>
                        <Separator className="mb-2" />
                        <p className='text-center'>Firma del Transportista</p>
                    </div>
                    <div className='w-1/2'>
                        <Separator className="mb-2" />
                        <p className='text-center'>Firma y Aclaración de Quien Recibe</p>
                    </div>
                </div>
                 <p className="text-center text-muted-foreground text-xs">
                    Documento no válido como factura. La mercadería viaja por cuenta y riesgo del comprador.
                </p>
               </div>
            </CardFooter>
          </Card>
        ) : (
            <Alert className='no-print max-w-4xl mx-auto'>
                <Info className='h-4 w-4'/>
                <AlertTitle>No hay ítems seleccionados</AlertTitle>
                <AlertDescription>
                    Por favor, selecciona al menos un ítem de la lista de arriba para generar el remito.
                </AlertDescription>
            </Alert>
        )
    }
    </>
  );
}
