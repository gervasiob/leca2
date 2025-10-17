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
import { orders, orderDetails, clients } from '@/lib/data';
import type { Order } from '@/lib/types';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import Link from 'next/link';

const getOrderProductionStatus = (orderId: number) => {
  const items = orderDetails.filter((od) => od.orderId === orderId);
  if (items.length === 0) return 'empty';

  const producedCount = items.filter(
    (item) => item.status === 'produced' || item.status === 'dispatched' || item.status === 'delivered' || item.status === 'resolved'
  ).length;

  if (producedCount === 0) return 'pending';
  if (producedCount === items.length) return 'completed';
  return 'partial';
};

const getClientName = (clientId: number) => {
  return clients.find((c) => c.id === clientId)?.name || 'N/A';
};

export default function DispatchPage() {
  const { completedOrders, partialOrders } = useMemo(() => {
    const completed: Order[] = [];
    const partial: Order[] = [];

    orders.forEach((order) => {
      const status = getOrderProductionStatus(order.id);
      if (status === 'completed') {
        // Only include orders that haven't been fully dispatched
        const details = orderDetails.filter(od => od.orderId === order.id);
        if(details.some(d => d.status === 'produced')) {
          completed.push(order);
        }
      } else if (status === 'partial') {
        const details = orderDetails.filter(od => od.orderId === order.id);
        if(details.some(d => d.status === 'produced')) {
            partial.push(order);
        }
      }
    });

    return { completedOrders: completed, partialOrders: partial };
  }, []);

  return (
    <>
      <PageHeader
        title="Remitos"
        description="Generar remitos para pedidos con producción completa o parcial."
      />
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos con Producción Completa</CardTitle>
            <CardDescription>
              Pedidos listos para generar el remito de todos sus items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{getClientName(order.clientId)}</TableCell>
                    <TableCell>{format(order.orderDate, 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      ${order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button size="sm" asChild>
                            <Link href={`/dispatch/${order.id}/generate/complete`}>
                                <FileText className="mr-2" />
                                Generar Remito
                            </Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {completedOrders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            No hay pedidos con producción completa.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos con Producción Parcial</CardTitle>
            <CardDescription>
              Pedidos con algunos items listos para ser despachados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partialOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{getClientName(order.clientId)}</TableCell>
                    <TableCell>{format(order.orderDate, 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      ${order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button size="sm" asChild>
                         <Link href={`/dispatch/${order.id}/generate/partial`}>
                            <FileText className="mr-2" />
                            Generar Remito Parcial
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {partialOrders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            No hay pedidos con producción parcial.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
