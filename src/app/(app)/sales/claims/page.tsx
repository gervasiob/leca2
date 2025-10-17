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
import { claims, orderDetails } from '@/lib/data';
import { format } from 'date-fns';
import { ClaimForm } from './claim-form';

export default function ClaimsPage() {
  return (
    <div className="grid flex-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <PageHeader
          title="Gestión de Reclamos"
          description="Maneja los reclamos de los clientes y genera respuestas."
        />
        <Card>
          <CardHeader>
            <CardTitle>Reclamos Abiertos</CardTitle>
            <CardDescription>
              Una lista de todos los reclamos sin resolver.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Reclamo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ítem del Pedido</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">#{claim.id}</TableCell>
                    <TableCell>{claim.clientName}</TableCell>
                    <TableCell>
                        #{claim.orderId}-{claim.orderDetailId}
                    </TableCell>
                    <TableCell>{claim.reason}</TableCell>
                    <TableCell>
                      <Badge variant={claim.status === 'open' ? 'destructive' : 'default'}>
                        {claim.status === 'open' ? 'Abierto' : claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(claim.createdAt, 'dd/MM/yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8 mt-8 lg:mt-0">
          <div className='lg:mt-[98px]'>
            <ClaimForm allOrderDetails={orderDetails} />
          </div>
      </div>
    </div>
  );
}
