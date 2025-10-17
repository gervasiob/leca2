'use client';

import { useState } from 'react';
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
import { MoreHorizontal, Upload, Download, FileUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

type PriceUpdatePreview = {
  'ID Producto': string;
  'Nombre del Producto': string;
  'Precio Anterior': number;
  'Precio Nuevo': number;
};


const getProductPrice = (productId: number) => {
  // Find a recent order detail for this product to get a price
  const detail = orderDetails.find((od) => od.productId === productId);
  return detail ? detail.unitPrice : 0;
};

export default function PriceListsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PriceUpdatePreview[]>([]);

  const handleDownloadTemplate = () => {
    const templateData = products.map(p => ({
        'ID Producto': p.id,
        'Nombre del Producto': p.name,
        'Precio Unitario': getProductPrice(p.id)
    }));

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_precios.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type !== 'text/csv') {
            toast({
                title: 'Archivo no válido',
                description: 'Por favor, sube un archivo en formato CSV.',
                variant: 'destructive'
            });
            return;
        }
        setFile(selectedFile);
        parseFile(selectedFile);
    }
  }

  const parseFile = (file: File) => {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const updates: PriceUpdatePreview[] = [];
            results.data.forEach((row: any) => {
                const productId = row['ID Producto']?.trim();
                const newPrice = parseFloat(row['Precio Unitario']);

                if (productId && !isNaN(newPrice)) {
                    const product = products.find(p => p.id === parseInt(productId, 10));
                    if (product) {
                        updates.push({
                            'ID Producto': productId,
                            'Nombre del Producto': product.name,
                            'Precio Anterior': getProductPrice(product.id),
                            'Precio Nuevo': newPrice
                        });
                    }
                }
            });
            setPreviewData(updates);
        },
        error: (error) => {
            toast({
                title: 'Error al leer el archivo',
                description: 'No se pudo procesar el archivo CSV. Revisa el formato.',
                variant: 'destructive'
            });
            console.error('CSV Parsing error: ', error);
        }
    });
  }

  const handleApplyUpdate = () => {
    // Here you would implement the actual price update logic
    console.log("Applying updates:", previewData);
    toast({
        title: "Actualización exitosa",
        description: `${previewData.length} precios han sido actualizados (simulación).`
    });
    setDialogOpen(false);
    setFile(null);
    setPreviewData([]);
  }

  return (
    <>
      <PageHeader
        title="Listas de Precios"
        description="Gestiona los precios de los productos y los descuentos de los clientes."
      >
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2" />
              Actualización Masiva
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Actualización Masiva de Precios</DialogTitle>
              <DialogDescription>
                Sube un archivo CSV para actualizar los precios de los productos en bloque.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <Card className='bg-muted/40'>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-base'>Paso 1: Descargar Plantilla</CardTitle>
                        <CardDescription className='text-sm'>
                            Descarga la plantilla CSV para asegurar el formato correcto.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={handleDownloadTemplate}>
                           <Download className="mr-2" />
                           Descargar Plantilla CSV
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-base'>Paso 2: Subir Archivo</CardTitle>
                        <CardDescription className='text-sm'>
                            Sube el archivo CSV con los precios actualizados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="csv-file">Archivo CSV</Label>
                            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                        </div>
                    </CardContent>
                </Card>

              {previewData.length > 0 && (
                <Card>
                    <CardHeader>
                         <CardTitle className='text-base'>Paso 3: Previsualizar y Confirmar</CardTitle>
                        <CardDescription className='text-sm'>
                           Revisa los cambios antes de aplicarlos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-64 overflow-y-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className='text-right'>Precio Anterior</TableHead>
                                    <TableHead className='text-right'>Precio Nuevo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewData.map(item => (
                                    <TableRow key={item['ID Producto']}>
                                        <TableCell>{item['Nombre del Producto']}</TableCell>
                                        <TableCell className='text-right'>${item['Precio Anterior'].toLocaleString()}</TableCell>
                                        <TableCell className='text-right text-primary font-medium'>${item['Precio Nuevo'].toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" onClick={handleApplyUpdate} disabled={previewData.length === 0}>
                <FileUp className='mr-2' />
                Aplicar Actualización ({previewData.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Precios Maestra</CardTitle>
          <CardDescription>
            Esta lista contiene el precio base para todos los productos.
          </CardDescription>
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
                  <TableCell className="hidden md:table-cell">
                    {product.type}
                  </TableCell>
                  <TableCell>{product.application}</TableCell>
                  <TableCell className="text-right">
                    ${getProductPrice(product.id).toLocaleString()}
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
                        <DropdownMenuItem>Editar Precio</DropdownMenuItem>
                        <DropdownMenuItem>
                          Ver Historial de Precios
                        </DropdownMenuItem>
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
