
import { PageHeader } from '@/components/page-header';
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
import { orderDetails, clients } from '@/lib/data';
import { format } from 'date-fns';
import type { OrderDetail } from '@/lib/types';

const getClientName = (clientId: number) => {
  return clients.find((c) => c.id === clientId)?.name || 'N/A';
};

export default function ProductionBatchesPage() {
  const pendingOrders = orderDetails.filter(
    (od) => od.status === 'pending'
  );

  const groupedPendingOrders: {
    productName: string;
    totalQuantity: number;
    count: number;
  }[] = pendingOrders.reduce((acc, order) => {
    const existingProduct = acc.find(
      (p) => p.productName === order.productName
    );
    if (existingProduct) {
      existingProduct.totalQuantity += order.quantity;
      existingProduct.count += 1;
    } else {
      acc.push({
        productName: order.productName,
        totalQuantity: order.quantity,
        count: 1,
      });
    }
    return acc;
  }, [] as { productName: string; totalQuantity: number; count: number }[]);

  return (
    <>
      <PageHeader
        title="Production Planning"
        description="View pending orders and group them for new batches."
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Pending Order Details</CardTitle>
            <CardDescription>
              All individual order items waiting for production.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell className="font-medium">
                      #{detail.orderId}-{detail.id}
                    </TableCell>
                    <TableCell>{getClientName(detail.clientId)}</TableCell>
                    <TableCell>{detail.productName}</TableCell>
                    <TableCell className="text-center">
                      {detail.quantity}
                    </TableCell>
                    <TableCell>
                      {format(
                        orderDetails.find((o) => o.orderId === detail.orderId)
                          ?.productionDate || new Date(),
                        'dd/MM/yyyy'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {pendingOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No pending orders.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Orders by Product</CardTitle>
            <CardDescription>
              Total quantities of pending products grouped together.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Total Quantity</TableHead>
                  <TableHead className="text-center"># Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedPendingOrders.map((product) => (
                  <TableRow key={product.productName}>
                    <TableCell className="font-medium">
                      {product.productName}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.totalQuantity}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.count}
                    </TableCell>
                  </TableRow>
                ))}
                {groupedPendingOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No pending orders.
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
