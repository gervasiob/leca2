'use client';

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
import { clients, orderDetails } from '@/lib/data';
import { MoreHorizontal, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Papa from 'papaparse';

// Dummy function to calculate balance
const getClientBalance = (clientId: number) => {
  return orderDetails
    .filter(
      (od) =>
        od.clientId === clientId &&
        od.status !== 'delivered' &&
        od.status !== 'resolved'
    )
    .reduce((acc, od) => acc + od.totalPrice, 0);
};

export default function AccountsReceivablePage() {
  const handleDownloadCSV = () => {
    const dataToExport = clients.map((client) => ({
      Cliente: client.name,
      CUIT: client.cuit,
      Teléfono: client.phone,
      'Saldo Pendiente': getClientBalance(client.id),
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cuentas_por_cobrar.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageHeader
        title="Cuentas por Cobrar"
        description="Gestiona las cuentas de clientes y realiza el seguimiento de los pagos pendientes."
      >
        <Button variant="outline" onClick={handleDownloadCSV}>
          <Download className="mr-2" />
          Descargar CSV
        </Button>
        <Button>Aplicar Pago</Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            Un listado de todos los clientes con saldos pendientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CUIT</TableHead>
                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                <TableHead className="text-right">Saldo Pendiente</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.cuit}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.phone}
                  </TableCell>
                  <TableCell className="text-right">
                    ${getClientBalance(client.id).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Alternar menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/accounts-receivable/${client.id}`}>
                            Ver Detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Aplicar Pago</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
