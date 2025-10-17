'use client';

import { useState, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { orderDetails, orders, clients } from '@/lib/data';
import type { OrderDetail } from '@/lib/types';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';


type SortKey = keyof OrderDetail | 'clientName' | 'orderDate' | 'totalPrice';
type SortDirection = 'asc' | 'desc';


const getClientName = (clientId: number) => {
    return clients.find(c => c.id === clientId)?.name || 'N/A';
}

const getOrderDate = (orderId: number) => {
    return orders.find(o => o.id === orderId)?.orderDate || new Date();
}

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    pending: "outline",
    produced: "secondary",
    dispatched: "default",
    delivered: "default",
    claimed: "destructive",
}

export default function SalesOrdersPage() {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>({ key: 'orderId', direction: 'desc' });
  
  const filteredAndSortedDetails = useMemo(() => {
    let filtered = orderDetails.filter((item) => {
      const clientName = getClientName(item.clientId).toLowerCase();
      const productName = item.productName.toLowerCase();
      const orderId = item.orderId.toString();
      const searchTerm = filter.toLowerCase();
      return (
        clientName.includes(searchTerm) || 
        productName.includes(searchTerm) ||
        orderId.includes(searchTerm)
      );
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        if(sortConfig.key === 'clientName') {
            aValue = getClientName(a.clientId);
            bValue = getClientName(b.clientId);
        } else if (sortConfig.key === 'orderDate') {
            aValue = getOrderDate(a.orderId);
            bValue = getOrderDate(b.orderId);
        } else {
            aValue = a[sortConfig.key as keyof OrderDetail];
            bValue = b[sortConfig.key as keyof OrderDetail];
        }
        
        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [filter, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const SortableHeader = ({
    sortKey,
    children,
    className,
  }: {
    sortKey: SortKey;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <Button
        variant="ghost"
        onClick={() => requestSort(sortKey)}
        className="px-2"
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );


  return (
    <>
      <PageHeader
        title="Sales & Orders"
        description="Manage all order details from creation to delivery."
      >
        <Button>Create New Order</Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>All items across all orders.</CardDescription>
          <div className="pt-4">
              <Input
                placeholder="Filter by order, client or product..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-sm"
              />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader sortKey="orderId">Order</SortableHeader>
                <SortableHeader sortKey="clientName">Client</SortableHeader>
                <SortableHeader sortKey="productName">Product</SortableHeader>
                <SortableHeader sortKey="color">Color</SortableHeader>
                <SortableHeader sortKey="quantity" className="text-center">Qty</SortableHeader>
                <SortableHeader sortKey="status">Status</SortableHeader>
                <SortableHeader sortKey="orderDate" className="hidden md:table-cell">Date</SortableHeader>
                <SortableHeader sortKey="totalPrice" className="text-right">Total</SortableHeader>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedDetails.map((detail) => (
                <TableRow key={detail.id}>
                  <TableCell className="font-medium">#{detail.orderId}-{detail.id}</TableCell>
                  <TableCell>{getClientName(detail.clientId)}</TableCell>
                  <TableCell>{detail.productName}</TableCell>
                  <TableCell>{detail.color}</TableCell>
                  <TableCell className="text-center">{detail.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[detail.status] || 'default'}>{detail.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{format(getOrderDate(detail.orderId), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right">${detail.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Confirm Dispatch</DropdownMenuItem>
                      <DropdownMenuItem>File a Claim</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {filteredAndSortedDetails.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
