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
        title="Price Lists"
        description="Manage product prices and client discounts."
      >
        <Button>Bulk Update</Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Master Price List</CardTitle>
          <CardDescription>This list contains the base price for all products.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Application</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
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
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit Price</DropdownMenuItem>
                      <DropdownMenuItem>View Price History</DropdownMenuItem>
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
