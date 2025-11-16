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
  CardFooter,
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
 
import type { Product } from '@/lib/types';
import { MoreHorizontal, Upload, Download, FileUp, Percent, DollarSign, X, ShieldCheck, ShieldOff, ChevronDown, ChevronUp } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PriceUpdatePreview = {
  'ID Producto': string;
  'Nombre del Producto': string;
  'Precio Anterior': number;
  'Precio Nuevo': number;
};

export default function PriceListsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PriceUpdatePreview[]>([]);
  const [prices, setPrices] = useState<Record<number, number>>({});
  const [statuses, setStatuses] = useState<Record<number, 'active' | 'inactive'>>({});
  const [priceLists, setPriceLists] = useState<{ id: number; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  
  const [filter, setFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [percentUpdate, setPercentUpdate] = useState('');
  const [valueUpdate, setValueUpdate] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [editPrice, setEditPrice] = useState<string>('');
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [assignedListId, setAssignedListId] = useState<number | null>(null);
  const [isSales, setIsSales] = useState(false);
  const [expandedColors, setExpandedColors] = useState<Set<number>>(new Set());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<{ date: string; price: number; source: 'order' | 'list' }[]>([]);
  const [historyProductName, setHistoryProductName] = useState<string>('');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  useEffect(() => {
    const loadLists = async () => {
      try {
        const [meRes, upRes, listsRes, prodsRes] = await Promise.all([
          fetch('/api/me', { credentials: 'include' }),
          fetch('/api/user-pricing/me', { credentials: 'include' }),
          fetch('/api/price-lists', { credentials: 'include' }),
          fetch('/api/products', { credentials: 'include' }),
        ]);

        const meData = await meRes.json().catch(() => ({}));
        const upData = await upRes.json().catch(() => ({}));
        const listsData = await listsRes.json().catch(() => ({}));
        const prodsData = await prodsRes.json().catch(() => ({}));

        const role = meData?.user?.role as string | undefined;
        const isPriv = role === 'Admin' || role === 'System';
        setIsPrivileged(!!isPriv);
        setIsSales(role === 'Sales');

        const assignedId: number | null = upData?.config?.priceListId ?? upData?.priceList?.id ?? null;
        setAssignedListId(assignedId);
        if (Array.isArray(prodsData?.products)) {
          setProducts(prodsData.products as Product[]);
        } else {
          setProducts([]);
        }

        let lists: Array<{ id: number; name: string; prices?: Record<number, number>; statuses?: Record<number, 'active' | 'inactive'> }> = Array.isArray(listsData?.priceLists) ? listsData.priceLists : [];
        if (!isPriv && assignedId) {
          lists = lists.filter((l) => l.id === assignedId);
        }

        setPriceLists(lists.map(l => ({ id: l.id, name: l.name })));

        const firstId = (!isPriv && assignedId) ? assignedId : (lists[0]?.id ?? null);
        if (firstId) {
          setSelectedListId(firstId);
          const found = lists.find(l => l.id === firstId);
          setPrices(found?.prices || {});
          setStatuses(found?.statuses || {});
        }
      } catch {
        setProducts([]);
        setPrices({});
        setStatuses({});
      }
    };
    loadLists();
  }, []);
  
  const filteredProducts = useMemo(() => {
    const f = filter.toLowerCase();
    const byText = products.filter(p => 
      p.name.toLowerCase().includes(f) ||
      p.type.toLowerCase().includes(f) ||
      p.application.toLowerCase().includes(f) ||
      (Array.isArray(p.colors) && p.colors.some(c => c.toLowerCase().includes(f)))
    );
    if (isSales || showOnlyActive) {
      return byText.filter(p => (statuses[p.id] ?? 'active') === 'active');
    }
    return byText;
  }, [filter, products, isSales, showOnlyActive, statuses]);

  const previewVisibleData = useMemo(() => {
    if (!showOnlyActive) return previewData;
    return previewData.filter((p) => (statuses[parseInt(String(p['ID Producto']), 10)] ?? 'active') === 'active');
  }, [previewData, showOnlyActive, statuses]);

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

  const toggleColors = (productId: number) => {
    setExpandedColors(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }
  
  const persistPrices = async (updated: Record<number, number>) => {
    if (!selectedListId) return;
    try {
      const payload: Record<string, number> = {};
      Object.entries(updated).forEach(([k, v]) => {
        payload[String(k)] = v;
      });
      const res = await fetch(`/api/price-lists/${selectedListId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prices: payload }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ title: 'No se pudo guardar', description: data?.error || 'Error al persistir cambios', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'No se pudo guardar', description: 'Error de red al persistir cambios', variant: 'destructive' });
    }
  };

  const persistStatuses = async (updated: Record<number, 'active' | 'inactive'>) => {
    if (!selectedListId) return;
    try {
      const payload: Record<string, 'active' | 'inactive'> = {} as any;
      Object.entries(updated).forEach(([k, v]) => {
        payload[String(k)] = v;
      });
      const res = await fetch(`/api/price-lists/${selectedListId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ statuses: payload }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ title: 'No se pudo guardar estados', description: data?.error || 'Error al persistir estados', variant: 'destructive' });
      }
      setStatuses(prev => ({ ...prev, ...updated }));
    } catch {
      toast({ title: 'No se pudo guardar estados', description: 'Error de red al persistir estados', variant: 'destructive' });
    }
  };

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
    persistPrices(newPrices);
    toast({
        title: "Precios Actualizados",
        description: `${updatedCount} productos seleccionados han sido actualizados.`
    });
    setSelectedProducts(new Set());
    setPercentUpdate('');
    setValueUpdate('');
  }
  
  const handleStatusUpdate = (status: 'active' | 'inactive') => {
    const newProducts = products.map(p => {
        if(selectedProducts.has(p.id)) {
            return {...p, status: status};
        }
        return p;
    });
    setProducts(newProducts);
    const statusMap: Record<number, 'active' | 'inactive'> = {};
    selectedProducts.forEach(pid => { statusMap[pid] = status; });
    persistStatuses(statusMap);
    toast({
        title: "Estados Actualizados",
        description: `${selectedProducts.size} productos han sido marcados como '${status === 'active' ? 'activos' : 'inactivos'}'.`
    });
    setSelectedProducts(new Set());
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
    const newPrices = { ...prices };
    previewData.forEach(item => {
        newPrices[parseInt(item['ID Producto'])] = item['Precio Nuevo'];
    });
    setPrices(newPrices);
    persistPrices(newPrices);
    toast({
        title: "Actualización exitosa",
        description: `${previewData.length} precios han sido actualizados.`
    });
    setDialogOpen(false);
    setFile(null);
    setPreviewData([]);
  }

  const openEdit = (product: Product) => {
    setEditProductId(product.id);
    setEditName(product.name);
    setEditStatus(statuses[product.id] ?? 'active');
    const p = prices[product.id] ?? 0;
    setEditPrice(String(Number.isFinite(p) ? p : 0));
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editProductId) return;
    const nextProducts = products.map(p => p.id === editProductId ? { ...p, name: editName.trim(), status: editStatus } : p);
    setProducts(nextProducts);
    const parsedPrice = parseFloat(editPrice);
    if (!isNaN(parsedPrice)) {
      const updated = { ...prices, [editProductId]: parsedPrice };
      setPrices(updated);
      await persistPrices(updated);
    }
    await persistStatuses({ [editProductId]: editStatus });
    toast({ title: 'Producto actualizado', description: 'Se guardaron los cambios.' });
    setEditOpen(false);
  };

  const handleCreateList = async () => {
    try {
      const baseName = 'Nueva Lista';
      const suffix = priceLists.length + 1;
      const res = await fetch('/api/price-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: `${baseName} ${suffix}` }),
      });
      const data = await res.json();
      if (res.ok) {
        const pl = data.priceList as { id: number; name: string };
        setPriceLists(prev => [...prev, { id: pl.id, name: pl.name }]);
        setSelectedListId(pl.id);
        setPrices({});
        setStatuses({});
        toast({ title: 'Lista creada', description: `Se creó '${pl.name}'.` });
      } else {
        toast({ title: 'No se pudo crear', description: data?.error || 'Error al crear lista', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'No se pudo crear', description: 'Error de red al crear lista', variant: 'destructive' });
    }
  };

  const handleRenameList = async () => {
    if (!selectedListId) return;
    const nextName = prompt('Nuevo nombre de la lista:', priceLists.find(p => p.id === selectedListId)?.name || '');
    if (!nextName || nextName.trim().length < 2) return;
    try {
      const res = await fetch(`/api/price-lists/${selectedListId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: nextName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setPriceLists(prev => prev.map(l => (l.id === selectedListId ? { ...l, name: nextName.trim() } : l)));
        toast({ title: 'Lista renombrada', description: `Ahora se llama '${nextName.trim()}'` });
      } else {
        toast({ title: 'No se pudo renombrar', description: data?.error || 'Error al renombrar lista', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'No se pudo renombrar', description: 'Error de red al renombrar lista', variant: 'destructive' });
    }
  };

  const openPriceHistory = async (product: Product) => {
    try {
      if (!selectedListId) {
        toast({ title: 'Historial', description: 'Seleccione una lista de precios primero.', variant: 'destructive' });
        return;
      }
      setHistoryProductName(product.name);
      const res = await fetch(`/api/price-history?listId=${selectedListId}&productId=${product.id}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data?.ok && Array.isArray(data?.history)) {
        const sorted = [...data.history].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistoryEntries(sorted);
        setIsHistoryOpen(true);
      } else {
        const msg = data?.error || 'No se pudo obtener el historial';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error de red', description: 'No se pudo cargar el historial.', variant: 'destructive' });
    }
  };

  const handleDeleteList = async () => {
    if (!selectedListId) return;
    if (!confirm('¿Eliminar esta lista de precios? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`/api/price-lists/${selectedListId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const remaining = priceLists.filter(l => l.id !== selectedListId);
        setPriceLists(remaining);
        const first = remaining[0];
        setSelectedListId(first ? first.id : null);
        setPrices(first ? {} : {});
        setStatuses({});
        toast({ title: 'Lista eliminada', description: 'Se eliminó la lista seleccionada.' });
      } else {
        toast({ title: 'No se pudo eliminar', description: data?.error || 'Error al eliminar lista', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'No se pudo eliminar', description: 'Error de red al eliminar lista', variant: 'destructive' });
    }
  };

  return (
    <>
      <PageHeader
        title="Listas de Precios"
        description="Gestiona los precios de los productos y los descuentos de los clientes."
      >
        <div className="flex items-center gap-2">
          <Select
            value={selectedListId ? String(selectedListId) : undefined}
            onValueChange={(v) => {
              const id = parseInt(v, 10);
              setSelectedListId(id);
              // fetch list to ensure latest prices
              const plMeta = priceLists.find(p => p.id === id);
              (async () => {
                try {
                  const res = await fetch('/api/price-lists', { credentials: 'include' });
                  const data = await res.json();
                  if (res.ok && Array.isArray(data?.priceLists)) {
                    const found = (data.priceLists as any[]).find((l) => l.id === id);
                    setPrices(found?.prices || {});
                    setStatuses(found?.statuses || {});
                  } else {
                    setPrices({});
                    setStatuses({});
                  }
                } catch {
                  setPrices({});
                  setStatuses({});
                }
              })();
            }}
          >
            <SelectTrigger className="w-[220px]" disabled={!isPrivileged}>
              <SelectValue placeholder="Selecciona una lista" />
            </SelectTrigger>
            <SelectContent>
              {priceLists.map(pl => (
                <SelectItem key={pl.id} value={String(pl.id)}>{pl.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isPrivileged && (
            <>
              <Button onClick={handleCreateList}>Nueva Lista</Button>
              <Button variant="secondary" onClick={handleRenameList}>Renombrar</Button>
              <Button variant="destructive" onClick={handleDeleteList}>Eliminar</Button>
            </>
          )}
        </div>
        <Button variant="outline" onClick={() => handleDownloadTemplate(false)}>
            <Download className="mr-2" />
            Descargar Lista
        </Button>
        {isPrivileged && (
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
                            {previewVisibleData.map(item => (
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
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>Modifica el estado y precio de la lista seleccionada.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nombre</Label>
                <Input className="col-span-3" value={editName} readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Estado</Label>
                <div className="col-span-3">
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as 'active' | 'inactive')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Precio</Label>
                <Input className="col-span-3" type="number" min="0" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={saveEdit}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {selectedProducts.size > 0 && (
        <Card className="mb-8 bg-muted/40 border-dashed">
            <CardHeader>
                <CardTitle className='text-lg'>Actualización Rápida</CardTitle>
                <CardDescription>
                    Aplicar cambios a los {selectedProducts.size} productos seleccionados.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
                <div className='flex flex-col gap-2'>
                    <Label htmlFor="percent-update">Aumentar por Porcentaje</Label>
                    <div className='flex gap-2'>
                        <div className='relative flex-1'>
                            <Percent className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                            <Input id="percent-update" type="number" placeholder='Ej: 15' className='pl-8' value={percentUpdate} onChange={e => setPercentUpdate(e.target.value)} />
                        </div>
                        <Button onClick={() => handleBulkUpdate('percent')} disabled={!percentUpdate}>Aplicar %</Button>
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <Label htmlFor="value-update">Aumentar por Valor Fijo</Label>
                    <div className='flex gap-2'>
                        <div className='relative flex-1'>
                            <DollarSign className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                            <Input id="value-update" type="number" placeholder='Ej: 500' className='pl-8' value={valueUpdate} onChange={e => setValueUpdate(e.target.value)} />
                        </div>
                        <Button onClick={() => handleBulkUpdate('value')} disabled={!valueUpdate}>Aplicar $</Button>
                    </div>
                </div>
                
                <div className='flex flex-col gap-2'>
                    <Label>Cambiar Estado</Label>
                    <div className='flex gap-2'>
                        <Button variant='outline' className='flex-1' onClick={() => handleStatusUpdate('active')}><ShieldCheck className="mr-2"/>Activar</Button>
                        <Button variant='destructive' className='flex-1' onClick={() => handleStatusUpdate('inactive')}><ShieldOff className="mr-2"/>Inactivar</Button>
                    </div>
                </div>

            </CardContent>
             <CardFooter className='justify-end'>
                <Button variant="ghost" size="sm" onClick={() => setSelectedProducts(new Set())}>
                    <X className="mr-2 h-4 w-4" />
                    Deseleccionar todo ({selectedProducts.size})
                </Button>
             </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{priceLists.find(p => p.id === selectedListId)?.name || 'Lista de Precios'}</CardTitle>
          <CardDescription>
            Precios unitarios vigentes para los productos en esta lista.
          </CardDescription>
          {isPrivileged && (
                        <div className="mt-2 flex items-center gap-2">
                          <Checkbox id="only-active" checked={showOnlyActive} onCheckedChange={(c) => setShowOnlyActive(!!c)} />
                          <Label htmlFor="only-active">Solo Activos</Label>
                        </div>
                      )}
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
                {!isSales && (
                  <TableHead className='w-[50px]'>
                    <Checkbox 
                      checked={selectedProducts.size > 0 && selectedProducts.size === filteredProducts.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                  </TableHead>
                )}
                <TableHead>ID Producto</TableHead>
                <TableHead>Nombre del Producto</TableHead>
                {!isSales && (<TableHead>Estado</TableHead>)}
                {(isSales || isPrivileged) && (<TableHead>Colores Disponibles</TableHead>)}
                <TableHead className="text-right">Precio Unitario</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} data-state={selectedProducts.has(product.id) && "selected"}>
                  {!isSales && (
                    <TableCell>
                      <Checkbox 
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">#{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  {!isSales && (
                    <TableCell>
                      <Badge variant={(statuses[product.id] ?? 'active') === 'active' ? 'default' : 'destructive'}>
                        {(statuses[product.id] ?? 'active') === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                  )}
                  {(isSales || isPrivileged) && (
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(expandedColors.has(product.id) ? product.colors : product.colors?.slice(0, 1))?.map((c, idx) => (
                          <Badge key={`${product.id}-color-${idx}`} variant="tag">{c}</Badge>
                        ))}
                        {product.colors && product.colors.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => toggleColors(product.id)} className="px-2 h-7">
                            {expandedColors.has(product.id) ? (
                              <ChevronUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            )}
                            {expandedColors.has(product.id) ? 'Ver menos' : `+${product.colors.length - 1}`}
                          </Button>
                        )}
                        {!product.colors?.length && (
                          <span className="text-muted-foreground">Sin colores</span>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    ${prices[product.id]?.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                  </TableCell>
                  <TableCell>
                    {isPrivileged && (
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
                          <DropdownMenuItem onClick={() => openEdit(product)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPriceHistory(product)}>
                            Ver Historial de Precios
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={isSales ? 5 : (isPrivileged ? 7 : 6)} className="text-center h-24">No se encontraron productos.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Historial de Precios */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Historial de Precios</DialogTitle>
            <DialogDescription>
              {historyProductName ? `Producto: ${historyProductName}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyEntries.map((h, idx) => (
                  <TableRow key={`hist-${idx}`}>
                    <TableCell>{new Date(h.date).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell>{h.source === 'order' ? 'Orden' : 'Lista'}</TableCell>
                    <TableCell className="text-right">${h.price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                  </TableRow>
                ))}
                {historyEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-20">Sin registros de historial.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
