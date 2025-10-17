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
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { format } from 'date-fns';

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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderDetails.map((detail) => (
                <TableRow key={detail.id}>
                  <TableCell className="font-medium">#{detail.orderId}-{detail.id}</TableCell>
                  <TableCell>{getClientName(detail.clientId)}</TableCell>
                  <TableCell>{detail.productName}</TableCell>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
