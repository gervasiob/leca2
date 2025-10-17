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
import { products, orderDetails } from '@/lib/data';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  

const getProductPrice = (productId: number) => {
    // Find a recent order detail for this product to get a price
    const detail = orderDetails.find(od => od.productId === productId);
    return detail ? detail.unitPrice : 0;
}


export default function PriceListsPage() {
  return (
    <>
      <PageHeader
        title="Listas de Precios"
        description="Gestiona los precios de los productos y los descuentos de los clientes."
      >
        <Button>Actualización Masiva</Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Precios Maestra</CardTitle>
          <CardDescription>Esta lista contiene el precio base para todos los productos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Producto</TableHead>
                <TableHead>Nombre del Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Aplicación</TableHead>
                <TableHead className="text-right">Precio Unitario</TableHead>
                <TableHead>
                    <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">#{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{product.type}</TableCell>
                  <TableCell>{product.application}</TableCell>
                  <TableCell className="text-right">${getProductPrice(product.id).toLocaleString()}</TableCell>
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
                      <DropdownMenuItem>Editar Precio</DropdownMenuItem>
                      <DropdownMenuItem>Ver Historial de Precios</DropdownMenuItem>
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
