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
import { format } from 'date-fns';
import type { OrderDetail, OrderDetailStatus } from '@/lib/types';
import { MoreHorizontal, ArrowUpDown, Download } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input';
import Papa from 'papaparse';


type SortKey = keyof OrderDetail | 'clientName' | 'orderDate' | 'totalPrice';
type SortDirection = 'asc' | 'desc';

const statusTranslations: Record<OrderDetailStatus, string> = {
    pending: "Pendiente",
    produced: "Producido",
    dispatched: "Despachado",
    delivered: "Entregado",
    claimed: "Reclamado",
    resolved: "Resuelto",
    cancelled: "Cancelado"
};

const getClientName = (detailsEntry: any) => detailsEntry.clientName || 'N/A';
const getOrderDate = (detailsEntry: any): Date | null => detailsEntry.orderDate ? new Date(detailsEntry.orderDate) : null;

const statusVariantMap: { [key in OrderDetailStatus]: "default" | "secondary" | "destructive" | "outline" } = {
    pending: "outline",
    produced: "secondary",
    dispatched: "default",
    delivered: "default",
    claimed: "destructive",
    resolved: "default",
    cancelled: "destructive",
}

// Datos vienen del backend, no usamos usuario simulado

export default function SalesOrdersPage() {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>({ key: 'orderId', direction: 'desc' });
  const [isClient, setIsClient] = useState(false);
  const [details, setDetails] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/orders', { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data?.ok && Array.isArray(data.details)) {
          setDetails(data.details);
        } else {
          setDetails([]);
        }
      } catch {
        setDetails([]);
      }
    };
    load();
  }, []);

  const filteredAndSortedDetails = useMemo(() => {
    let baseDetails = details;

    let filtered = baseDetails.filter((item) => {
      const clientName = getClientName(item).toLowerCase();
      const productName = String(item.productName || '').toLowerCase();
      const orderId = String(item.orderId);
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
            aValue = getClientName(a);
            bValue = getClientName(b);
        } else if (sortConfig.key === 'orderDate') {
            aValue = getOrderDate(a);
            bValue = getOrderDate(b);
        } else {
            aValue = a[sortConfig.key as keyof OrderDetail];
            bValue = b[sortConfig.key as keyof OrderDetail];
        }
        
        if (aValue === null) return 1;
        if (bValue === null) return -1;
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

  const handleDownloadCSV = () => {
    const dataToExport = filteredAndSortedDetails.map((detail) => {
      const orderDate = getOrderDate(detail.orderId);
      return {
        'ID Pedido': `${detail.orderId}-${detail.id}`,
        'Cliente': getClientName(detail.clientId),
        'Producto': detail.productName,
        'Color': detail.color,
        'Cantidad': detail.quantity,
        'Estado': statusTranslations[detail.status],
        'Fecha': orderDate ? format(orderDate, 'dd/MM/yyyy') : 'N/A',
        'Total': detail.totalPrice,
      }
    });

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'detalle_pedidos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <PageHeader
        title="Ventas y Pedidos"
        description="Gestiona todos los detalles de los pedidos, desde la creación hasta la entrega."
      >
        <Button variant="outline" onClick={handleDownloadCSV}>
          <Download className="mr-2" />
          Descargar CSV
        </Button>
        <Button asChild>
          <Link href="/sales/orders/create">Crear Nuevo Pedido</Link>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Detalles de Pedidos</CardTitle>
          <CardDescription>Todos los ítems de todos los pedidos.</CardDescription>
          <div className="pt-4">
              <Input
                placeholder="Filtrar por pedido, cliente o producto..."
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
                <SortableHeader sortKey="orderId">Pedido</SortableHeader>
                <SortableHeader sortKey="clientName">Cliente</SortableHeader>
                <SortableHeader sortKey="productName">Producto</SortableHeader>
                <SortableHeader sortKey="color">Color</SortableHeader>
                <SortableHeader sortKey="quantity" className="text-center">Cant.</SortableHeader>
                <SortableHeader sortKey="status">Estado</SortableHeader>
                <SortableHeader sortKey="orderDate" className="hidden md:table-cell">Fecha</SortableHeader>
                <SortableHeader sortKey="totalPrice" className="text-right">Total</SortableHeader>
                <TableHead>
                    <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedDetails.map((detail) => {
                const orderDate = getOrderDate(detail);
                return (
                <TableRow key={detail.id}>
                  <TableCell className="font-medium">#{detail.orderId}-{detail.id}</TableCell>
                  <TableCell>{getClientName(detail)}</TableCell>
                  <TableCell>{detail.productName}</TableCell>
                  <TableCell>{detail.color}</TableCell>
                  <TableCell className="text-center">{detail.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[detail.status] || 'default'}>{statusTranslations[detail.status]}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{isClient && orderDate ? format(orderDate, 'dd/MM/yyyy') : 'N/A'}</TableCell>
                  <TableCell className="text-right">${detail.totalPrice.toLocaleString('es-AR')}</TableCell>
                  <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Alternar menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                      <DropdownMenuItem>Confirmar Despacho</DropdownMenuItem>
                      <DropdownMenuItem>Iniciar Reclamo</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
               {filteredAndSortedDetails.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No se encontraron resultados.
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
