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
import { productionBatches } from '@/lib/data';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { format } from 'date-fns';

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    Planned: "outline",
    "In Progress": "secondary",
    Completed: "default",
}

export default function ProductionBatchesPage() {
  return (
    <>
      <PageHeader
        title="Production Batches"
        description="Manage and track production batches."
      >
        <Button>Create New Batch</Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Batches</CardTitle>
          <CardDescription>A list of all production batches.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="hidden md:table-cell">Planned Date</TableHead>
                <TableHead className="hidden md:table-cell">Production Date</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">#{batch.batchNumber}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[batch.status] || 'default'}>{batch.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{batch.items.length}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(batch.plannedDate, 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(batch.productionDate, 'dd/MM/yyyy')}</TableCell>
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
                      <DropdownMenuItem>Generate QR Codes</DropdownMenuItem>
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
