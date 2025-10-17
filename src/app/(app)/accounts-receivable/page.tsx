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
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  

// Dummy function to calculate balance
const getClientBalance = (clientId: number) => {
    return orderDetails
        .filter(od => od.clientId === clientId && od.status !== 'delivered' && od.status !== 'resolved')
        .reduce((acc, od) => acc + od.totalPrice, 0);
}


export default function AccountsReceivablePage() {
  return (
    <>
      <PageHeader
        title="Accounts Receivable"
        description="Manage client accounts and track pending payments."
      >
        <Button>Apply Payment</Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>A list of all clients with pending balances.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>CUIT</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="text-right">Pending Balance</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.cuit}</TableCell>
                  <TableCell className="hidden md:table-cell">{client.phone}</TableCell>
                  <TableCell className="text-right">${getClientBalance(client.id).toLocaleString()}</TableCell>
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
                      <DropdownMenuItem asChild>
                        <Link href={`/accounts-receivable/${client.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Apply Payment</DropdownMenuItem>
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
