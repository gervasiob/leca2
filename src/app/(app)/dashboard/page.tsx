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
import { useRouter } from 'next/navigation';
import type { OrderDetail } from '@/lib/types';

const loggedInUser = users.find(u => u.id === 2); // Simulating sales user logged in

export default function Dashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
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
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) throw new Error('No autenticado');
        setAuthChecked(true);
      } catch {
        router.replace('/login?next=/dashboard');
      }
    })();
  }, []);

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

  if (!authChecked) {
    return null;
  }
  
  return (
    <div className="flex flex-col w-full">
      <PageHeader
        title="Tablero"
        description="Un resumen del rendimiento de tu fábrica."
      >
      </PageHeader>
    </div>
  );
}
