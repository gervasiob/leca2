'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { orderDetails } from '@/lib/data';

const statusTranslations: { [key: string]: string } = {
  pending: 'Pendiente',
  produced: 'Producido',
  dispatched: 'Despachado',
  delivered: 'Entregado',
  claimed: 'Reclamado',
  resolved: 'Resuelto',
  cancelled: 'Cancelado',
};

const statusCounts = orderDetails.reduce((acc, detail) => {
  const translatedStatus = statusTranslations[detail.status] || detail.status;
  acc[translatedStatus] = (acc[translatedStatus] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const data = Object.entries(statusCounts).map(([name, value]) => ({
  name,
  value,
}));

const chartConfig = {
  value: {
    label: 'Pedidos',
  },
  Pendiente: {
    label: 'Pendiente',
    color: 'hsl(var(--chart-1))',
  },
  Producido: {
    label: 'Producido',
    color: 'hsl(var(--chart-2))',
  },
  Despachado: {
    label: 'Despachado',
    color: 'hsl(var(--chart-3))',
  },
  Entregado: {
    label: 'Entregado',
    color: 'hsl(var(--chart-4))',
  },
  Reclamado: {
    label: 'Reclamado',
    color: 'hsl(var(--chart-5))',
  },
};

export function StatusChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={
                  chartConfig[entry.name as keyof typeof chartConfig]?.color
                }
                className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
