import Link from 'next/link';
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
import { orderDetails, clients, productionBatches } from '@/lib/data';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const getClientName = (clientId: number) => {
  return clients.find((c) => c.id === clientId)?.name || 'N/A';
};

const statusVariantMap: { [key: string]: 'default' | 'secondary' | 'outline' } = {
  'Planned': 'outline',
  'In Progress': 'secondary',
  'Completed': 'default',
};


export default function ProductionBatchesPage() {
  const pendingOrders = orderDetails.filter(
    (od) => od.status === 'pending'
  );

  const groupedPendingOrders: {
    productName: string;
    color: string;
    totalQuantity: number;
    count: number;
  }[] = pendingOrders.reduce((acc, order) => {
    const key = `${order.productName}-${order.color}`;
    const existingProduct = acc.find(
      (p) => p.productName === order.productName && p.color === order.color
    );
    if (existingProduct) {
      existingProduct.totalQuantity += order.quantity;
      existingProduct.count += 1;
    } else {
      acc.push({
        productName: order.productName,
        color: order.color,
        totalQuantity: order.quantity,
        count: 1,
      });
    }
    return acc;
  }, [] as { productName: string; color: string; totalQuantity: number; count: number }[]);

  return (
    <>
      <PageHeader
        title="Planificación de Producción"
        description="Visualiza pedidos pendientes y agrúpalos para nuevos lotes."
      >
        <Button asChild>
          <Link href="/production/batches/create">Crear Lote</Link>
        </Button>
    </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Pedidos Pendientes</CardTitle>
            <CardDescription>
              Todos los ítems de pedidos individuales esperando producción.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-center">Cant.</TableHead>
                  <TableHead>Fecha</TableHead>
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
                    <TableCell>{detail.color}</TableCell>
                    <TableCell className="text-center">
                      {detail.quantity}
                    </TableCell>
                    <TableCell>
                      {detail.productionDate ? format(detail.productionDate, 'dd/MM/yyyy') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {pendingOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No hay pedidos pendientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pendientes por Producto y Color</CardTitle>
            <CardDescription>
              Cantidades totales de productos pendientes agrupados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-center">Cantidad Total</TableHead>
                  <TableHead className="text-center"># Pedidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedPendingOrders.map((product) => (
                  <TableRow key={`${product.productName}-${product.color}`}>
                    <TableCell className="font-medium">
                      {product.productName}
                    </TableCell>
                    <TableCell>
                      {product.color}
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
                    <TableCell colSpan={4} className="text-center">
                      No hay pedidos pendientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
            <CardTitle>Lotes de Producción</CardTitle>
            <CardDescription>
                Lotes de producción actuales y pasados.
            </CardDescription>
        </CardHeader>
        <CardContent>
        <div className="border rounded-md">
        <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote #</TableHead>
                  <TableHead>Ítems</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Producción</TableHead>
                   <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionBatches.map((batch) => (
                  <TableRow key={batch.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                        <Link href={`/production/batches/${batch.id}`} className="font-medium text-primary hover:underline">{batch.batchNumber}</Link>
                    </TableCell>
                    <TableCell>{batch.items.length}</TableCell>
                    <TableCell>
                        <Badge variant={statusVariantMap[batch.status] || 'default'}>{batch.status}</Badge>
                    </TableCell>
                    <TableCell>{format(batch.productionDate, 'PPP')}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" asChild>
                          <Link href={`/production/batches/${batch.id}`}>
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Ver Detalles</span>
                          </Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {productionBatches.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No se encontraron lotes de producción.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
