'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const tableNames = ['user', 'role', 'client', 'product', 'order', 'orderDetail', 'claim'];

export default function DbViewerPage() {
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.ok && data.user?.role === 'System') {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } catch {
        setAuthorized(false);
      }
    };
    checkAuth();
  }, []);

  const fetchData = async (tableName: string) => {
    if (!tableName) return;
    setIsLoading(true);
    setError(null);
    setTableData(null);
    try {
      const res = await fetch('/api/dev/db-viewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }
      setTableData(data.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    fetchData(tableName);
  };
  
  if (isAuthorized === null) {
    return (
        <div className="flex h-[80vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Acceso Denegado</AlertTitle>
          <AlertDescription>
            No tienes permisos para acceder a esta página. Solo los usuarios con rol 'System' pueden verla.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Visor de Base de Datos"
        description="Selecciona una tabla para ver su contenido. Esta página no es afectada por el middleware."
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Tabla</CardTitle>
            <Select onValueChange={handleTableChange} value={selectedTable}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Elige una tabla" />
              </SelectTrigger>
              <SelectContent>
                {tableNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <CardTitle>Datos de la Tabla: {selectedTable}</CardTitle>
            <CardDescription className="mb-4">
              Mostrando el contenido de la tabla seleccionada.
            </CardDescription>
            <ScrollArea className="h-[500px] w-full rounded-md border bg-muted/20 p-4">
              {isLoading && (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {error && <pre className="text-destructive">{error}</pre>}
              {tableData && (
                <pre className="text-sm">
                  {JSON.stringify(tableData, null, 2)}
                </pre>
              )}
               {!isLoading && !tableData && !error && (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                    Selecciona una tabla para ver los datos.
                </div>
               )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
