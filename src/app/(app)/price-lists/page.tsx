'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { products, orderDetails } from '@/lib/data';
import { MoreHorizontal, Upload, Download, FileUp, Percent, DollarSign, X } from 'lucide-react';
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
  const [prices, setPrices] = useState<Record<number, number>>({});
  
  const [filter, setFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [percentUpdate, setPercentUpdate] = useState('');
  const [valueUpdate, setValueUpdate] = useState('');


  useEffect(() => {
    const initialPrices: Record<number, number> = {};
    products.forEach(product => {
      initialPrices[product.id] = getProductPrice(product.id);
    });
    setPrices(initialPrices);
  }, []);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.type.toLowerCase().includes(filter.toLowerCase()) ||
        p.application.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter]);

  const handleSelectProduct = (productId: number, checked: boolean) => {
    setSelectedProducts(prev => {
        const newSet = new Set(prev);
        if(checked) {
            newSet.add(productId);
        } else {
            newSet.delete(productId);
        }
        return newSet;
    });
  }
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    } else {
        setSelectedProducts(new Set());
    }
  }
  
  const handleBulkUpdate = (type: 'percent' | 'value') => {
    const newPrices = {...prices};
    let updatedCount = 0;

    selectedProducts.forEach(productId => {
        const currentPrice = newPrices[productId] || 0;
        if(type === 'percent') {
            const percent = parseFloat(percentUpdate);
            if(!isNaN(percent)) {
                newPrices[productId] = currentPrice * (1 + percent / 100);
                updatedCount++;
            }
        } else {
            const value = parseFloat(valueUpdate);
            if(!isNaN(value)) {
                newPrices[productId] = currentPrice + value;
                updatedCount++;
            }
        }
    });

    setPrices(newPrices);
    toast({
        title: "Precios Actualizados",
        description: `${updatedCount} productos seleccionados han sido actualizados.`
    });
    setSelectedProducts(new Set());
    setPercentUpdate('');
    setValueUpdate('');
  }

  const handleDownloadTemplate = (isTemplate: boolean = true) => {
    const dataToDownload = products.map(p => ({
        'ID Producto': p.id,
        'Nombre del Producto': p.name,
        'Precio Unitario': isTemplate ? '' : prices[p.id] || 0
    }));

    const csv = Papa.unparse(dataToDownload);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', isTemplate ? 'plantilla_precios.csv' : 'lista_de_precios_actual.csv');
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
                            'Precio Anterior': prices[product.id] || 0,
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
    console.log("Applying updates:", previewData);
    const newPrices = { ...prices };
    previewData.forEach(item => {
        newPrices[parseInt(item['ID Producto'])] = item['Precio Nuevo'];
    });
    setPrices(newPrices);
    toast({
        title: "Actualización exitosa",
        description: `${previewData.length} precios han sido actualizados.`
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
        <Button variant="outline" onClick={() => handleDownloadTemplate(false)}>
            <Download className="mr-2" />
            Descargar Lista
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2" />
              Actualización Masiva CSV
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
                        <Button variant="outline" onClick={() => handleDownloadTemplate(true)}>
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
                                        <TableCell className='text-right'>${item['Precio Anterior'].toLocaleString('es-AR')}</TableCell>
                                        <TableCell className='text-right text-primary font-medium'>${item['Precio Nuevo'].toLocaleString('es-AR')}</TableCell>
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

      {selectedProducts.size > 0 && (
        <Card className="mb-8 bg-muted/40 border-dashed">
            <CardHeader>
                <CardTitle className='text-lg'>Actualización Rápida</CardTitle>
                <CardDescription>
                    Aplicar un cambio de precio a los {selectedProducts.size} productos seleccionados.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className='flex-1 w-full sm:w-auto'>
                    <Label htmlFor="percent-update">Aumentar por Porcentaje</Label>
                    <div className='relative'>
                        <Percent className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input id="percent-update" type="number" placeholder='Ej: 15' className='pl-8' value={percentUpdate} onChange={e => setPercentUpdate(e.target.value)} />
                    </div>
                </div>
                <Button onClick={() => handleBulkUpdate('percent')} disabled={!percentUpdate}>Aplicar %</Button>

                <div className='flex-1 w-full sm:w-auto'>
                    <Label htmlFor="value-update">Aumentar por Valor Fijo</Label>
                     <div className='relative'>
                        <DollarSign className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input id="value-update" type="number" placeholder='Ej: 500' className='pl-8' value={valueUpdate} onChange={e => setValueUpdate(e.target.value)} />
                    </div>
                </div>
                <Button onClick={() => handleBulkUpdate('value')} disabled={!valueUpdate}>Aplicar $</Button>
                
                <div className='border-l h-10 mx-4 hidden sm:block' />

                <Button variant="ghost" size="icon" className='self-end' onClick={() => setSelectedProducts(new Set())}>
                    <X className="h-4 w-4" />
                    <span className='sr-only'>Deseleccionar todo</span>
                </Button>

            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Precios Maestra</CardTitle>
          <CardDescription>
            Esta lista contiene el precio base para todos los productos.
          </CardDescription>
          <div className='pt-4'>
            <Input 
                placeholder="Filtrar por nombre, tipo o aplicación..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px]'>
                    <Checkbox 
                        checked={selectedProducts.size > 0 && selectedProducts.size === filteredProducts.length}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                </TableHead>
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
              {filteredProducts.map((product) => (
                <TableRow key={product.id} data-state={selectedProducts.has(product.id) && "selected"}>
                  <TableCell>
                      <Checkbox 
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                      />
                  </TableCell>
                  <TableCell className="font-medium">#{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.type}
                  </TableCell>
                  <TableCell>{product.application}</TableCell>
                  <TableCell className="text-right">
                    ${(prices[product.id] || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
              {filteredProducts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">No se encontraron productos.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
