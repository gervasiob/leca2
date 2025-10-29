'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { clients, orderDetails, orders, claims, users } from '@/lib/data';
import { SalesChart } from './sales-chart';
import { StatusChart } from './status-chart';
import {
  DollarSign,
  Users,
  Package,
  AlertCircle,
  Calendar as CalendarIcon,
  Activity,
} from 'lucide-react';
import {
  format,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import type { OrderDetail } from '@/lib/types';

const loggedInUser = users.find(u => u.id === 2); // Simulating sales user logged in

export default function Dashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [clientsWithPendingBalance, setClientsWithPendingBalance] = useState(0);
  const [pendingToProduceAmount, setPendingToProduceAmount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<OrderDetail[]>([]);
  
  useEffect(() => {
    const isSalesRole = loggedInUser?.role === 'Sales';
    const salesUserOrderIds = isSalesRole 
      ? new Set(orders.filter(o => o.userId === loggedInUser.id).map(o => o.id))
      : new Set();

    const filteredOrders = orders.filter((order) => {
        const inDateRange = (!date?.from || !date?.to) || isWithinInterval(order.orderDate, { start: date.from, end: date.to });
        const isUserOrder = !isSalesRole || salesUserOrderIds.has(order.id);
        return inDateRange && isUserOrder;
    });

    const filteredOrderDetails = orderDetails.filter(od => !isSalesRole || salesUserOrderIds.has(od.orderId));
    
    const calculatedTotalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const calculatedPendingToProduceAmount = filteredOrderDetails
      .filter((od) => od.status === 'pending')
      .reduce((acc, od) => acc + od.totalPrice, 0);

    const calculatedPendingRevenue = filteredOrderDetails
      .filter(
        (od) => od.status !== 'delivered' && od.status !== 'resolved'
      )
      .reduce((acc, od) => acc + od.totalPrice, 0);

    const salesUserClientIds = isSalesRole ? new Set(filteredOrderDetails.map(od => od.clientId)) : new Set();
    const filteredClients = isSalesRole ? clients.filter(c => salesUserClientIds.has(c.id)) : clients;

    const calculatedClientsWithPendingBalance = filteredClients.filter((client) => {
      const balance = filteredOrderDetails
        .filter(
          (od) =>
            od.clientId === client.id &&
            od.status !== 'delivered' &&
            od.status !== 'resolved'
        )
        .reduce((acc, od) => acc + od.totalPrice, 0);
      return balance > 0;
    }).length;

    setTotalRevenue(calculatedTotalRevenue);
    setPendingToProduceAmount(calculatedPendingToProduceAmount);
    setPendingRevenue(calculatedPendingRevenue);
    setClientsWithPendingBalance(calculatedClientsWithPendingBalance);
    setRecentActivities(filteredOrderDetails.slice(0, 5));
  }, [date]);

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        title="Tablero"
        description="Un resumen del rendimiento de tu fábrica."
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-[300px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} -{' '}
                    {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>Elige una fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos del período seleccionado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Pendientes
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${pendingRevenue.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Monto total pendiente de cobro.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes con Deuda
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{clientsWithPendingBalance}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes con saldos pendientes.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Producción Pendiente
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${pendingToProduceAmount.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor de ítems pendientes de producción.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reclamos Abiertos
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claims.filter((c) => c.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Resumen de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Estado de Pedidos</CardTitle>
            <CardDescription>
              Distribución de los estados actuales de los pedidos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Un registro de las actualizaciones de pedidos más recientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido ID</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    #{activity.orderId}
                  </TableCell>
                  <TableCell>{activity.productName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(activity.productionDate || new Date(), 'PPP')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    