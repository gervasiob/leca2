'use client';

import { useState, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { orderDetails, clients } from '@/lib/data';
import type { OrderDetail } from '@/lib/types';
import { ArrowUpDown, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

type SortKey = keyof OrderDetail | 'clientName';
type SortDirection = 'asc' | 'desc';

const getClientName = (clientId: number) => {
  return clients.find((c) => c.id === clientId)?.name || 'N/A';
};

export default function CreateBatchPage() {
  const [filter, setFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>({ key: 'orderId', direction: 'asc' });

  const pendingOrders = useMemo(() => {
    return orderDetails.filter((od) => od.status === 'pending');
  }, []);

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = pendingOrders.filter((item) => {
      const clientName = getClientName(item.clientId).toLowerCase();
      const productName = item.productName.toLowerCase();
      const searchTerm = filter.toLowerCase();
      return (
        clientName.includes(searchTerm) || productName.includes(searchTerm)
      );
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue =
          sortConfig.key === 'clientName'
            ? getClientName(a.clientId)
            : a[sortConfig.key];
        const bValue =
          sortConfig.key === 'clientName'
            ? getClientName(b.clientId)
            : b[sortConfig.key];
        
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
  }, [pendingOrders, filter, sortConfig]);

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
    if (selectedItems.size === filteredAndSortedOrders.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedOrders.map(item => item.id)));
    }
  };

  const selectedOrderDetails = useMemo(() => {
    return pendingOrders.filter(item => selectedItems.has(item.id));
  }, [selectedItems, pendingOrders]);

  const footerSummary = useMemo(() => {
    const summary = selectedOrderDetails.reduce((acc, item) => {
        const existing = acc.find(p => p.productName === item.productName);
        if (existing) {
            existing.totalQuantity += item.quantity;
            existing.count += 1;
        } else {
            acc.push({
                productName: item.productName,
                totalQuantity: item.quantity,
                count: 1
            });
        }
        return acc;
    }, [] as { productName: string; totalQuantity: number; count: number }[]);
    return summary;
  }, [selectedOrderDetails]);

  const SortableHeader = ({
    sortKey,
    children,
  }: {
    sortKey: SortKey;
    children: React.ReactNode;
  }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => requestSort(sortKey)}
        className="px-0"
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <>
      <PageHeader
        title="Create Production Batch"
        description="Select pending orders to include in a new production batch."
      >
        <Button variant="outline" asChild>
            <Link href="/production/batches">
                <ChevronLeft className='mr-2' />
                Back to Batches
            </Link>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Select Pending Orders</CardTitle>
          <CardDescription>
            Filter and select the items to be produced.
          </CardDescription>
          <Input
            placeholder="Filter by product or client..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead padding="checkbox" className="w-[60px]">
                    <Checkbox
                        checked={selectedItems.size > 0 && selectedItems.size === filteredAndSortedOrders.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                    />
                  </TableHead>
                  <SortableHeader sortKey="orderId">Order</SortableHeader>
                  <SortableHeader sortKey="clientName">Client</SortableHeader>
                  <SortableHeader sortKey="productName">Product</SortableHeader>
                  <SortableHeader sortKey="quantity">Qty</SortableHeader>
                  <SortableHeader sortKey="productionDate">Date</SortableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedOrders.map((detail) => (
                  <TableRow
                    key={detail.id}
                    data-state={selectedItems.has(detail.id) && "selected"}
                  >
                    <TableCell padding="checkbox">
                        <Checkbox
                            checked={selectedItems.has(detail.id)}
                            onCheckedChange={() => toggleSelectItem(detail.id)}
                            aria-label="Select row"
                        />
                    </TableCell>
                    <TableCell className="font-medium">
                      #{detail.orderId}-{detail.id}
                    </TableCell>
                    <TableCell>{getClientName(detail.clientId)}</TableCell>
                    <TableCell>{detail.productName}</TableCell>
                    <TableCell>{detail.quantity}</TableCell>
                    <TableCell>
                      {format(new Date(), 'dd/MM/yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
                 {filteredAndSortedOrders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                            No matching pending orders found.
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
            <div className="w-full">
                <h3 className="text-lg font-semibold">Batch Summary</h3>
                <p className="text-sm text-muted-foreground">This is what will be included in the new batch.</p>
            </div>
          {footerSummary.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Total Quantity</TableHead>
                        <TableHead className="text-right"># of Orders</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {footerSummary.map(summaryItem => (
                        <TableRow key={summaryItem.productName}>
                            <TableCell className="font-medium">{summaryItem.productName}</TableCell>
                            <TableCell className="text-right">{summaryItem.totalQuantity}</TableCell>
                            <TableCell className="text-right">{summaryItem.count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground w-full py-4">
              Select items from the table above to add them to the batch.
            </div>
          )}
          <div className="w-full flex justify-end">
            <Button disabled={selectedOrderDetails.length === 0}>
                Create Batch ({selectedOrderDetails.length} items)
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
