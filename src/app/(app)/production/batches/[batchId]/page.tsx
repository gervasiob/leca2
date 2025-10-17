'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { productionBatches, clients, orderDetails } from '@/lib/data';
import type { OrderDetail } from '@/lib/types';
import { ArrowLeft, ChevronLeft, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';


const getClientName = (clientId: number) => {
  return clients.find((c) => c.id === clientId)?.name || 'N/A';
};

const statusVariantMap: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
    'Planned': 'outline',
    'In Progress': 'secondary',
    'Completed': 'default',
  };

export default function BatchDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const batchId = parseInt(params.batchId as string, 10);
  const batch = useMemo(() => productionBatches.find(b => b.id === batchId), [batchId]);

  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  if (!batch) {
    notFound();
  }

  const batchItems = useMemo(() => {
    return orderDetails.filter(od => batch.items.some(item => item.id === od.id));
  }, [batch.items]);

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
    if (selectedItems.size === batchItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(batchItems.map(item => item.id)));
    }
  };
  
  const handleConfirmProduction = () => {
    // Here you would typically update the state in your backend
    console.log("Confirming production for items:", Array.from(selectedItems));
    toast({
        title: "Producción Confirmada",
        description: `${selectedItems.size} ítems han sido marcados como 'producidos'.`
    });
    setSelectedItems(new Set());
  }
  
  const handleUnlinkItems = () => {
     // Here you would typically update the state in your backend
    console.log("Unlinking items:", Array.from(selectedItems));
    toast({
        title: "Ítems Desvinculados",
        description: `${selectedItems.size} ítems han sido devueltos al grupo de pendientes.`,
        variant: "destructive"
    });
    setSelectedItems(new Set());
  }


  return (
    <>
      <PageHeader
        title={`Lote ${batch.batchNumber}`}
        description={`Gestiona los ítems dentro del lote de producción #${batch.batchNumber}.`}
      >
        <div className="flex items-center gap-4">
            <Badge variant={statusVariantMap[batch.status] || 'default'} className="text-base">
                {batch.status}
            </Badge>
            <Button variant="outline" asChild>
                <Link href="/production/batches">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Volver a Lotes
                </Link>
            </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Ítems del Lote</CardTitle>
          <CardDescription>
            Selecciona ítems para confirmar la producción o desvincularlos de este lote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">
                    <Checkbox
                        checked={selectedItems.size > 0 && selectedItems.size === batchItems.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Seleccionar todo"
                    />
                  </TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Cant.</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchItems.map((detail) => (
                  <TableRow
                    key={detail.id}
                    data-state={selectedItems.has(detail.id) && "selected"}
                  >
                    <TableCell>
                        <Checkbox
                            checked={selectedItems.has(detail.id)}
                            onCheckedChange={() => toggleSelectItem(detail.id)}
                            aria-label="Seleccionar fila"
                        />
                    </TableCell>
                    <TableCell className="font-medium">
                      #{detail.orderId}-{detail.id}
                    </TableCell>
                    <TableCell>{getClientName(detail.clientId)}</TableCell>
                    <TableCell>{detail.productName}</TableCell>
                    <TableCell>{detail.color}</TableCell>
                    <TableCell>{detail.quantity}</TableCell>
                    <TableCell>
                        <Badge variant={detail.isProduced ? 'default' : 'outline'}>{detail.isProduced ? 'Producido' : 'Pendiente'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                 {batchItems.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                            Este lote no tiene ítems.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="destructive" onClick={handleUnlinkItems} disabled={selectedItems.size === 0}>
                <X className="mr-2 h-4 w-4" />
                Desvincular del Lote ({selectedItems.size})
            </Button>
            <Button onClick={handleConfirmProduction} disabled={selectedItems.size === 0}>
                <Check className="mr-2 h-4 w-4" />
                Confirmar Producción ({selectedItems.size})
            </Button>
        </CardFooter>
      </Card>
    </>
  );
}
