'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { orderDetails } from '@/lib/data';

const statusCounts = orderDetails.reduce((acc, detail) => {
  acc[detail.status] = (acc[detail.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const data = Object.entries(statusCounts).map(([name, value]) => ({
  name: name.charAt(0).toUpperCase() + name.slice(1),
  value,
}));

const chartConfig = {
  value: {
    label: 'Orders',
  },
  Pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-1))',
  },
  Produced: {
    label: 'Produced',
    color: 'hsl(var(--chart-2))',
  },
  Dispatched: {
    label: 'Dispatched',
    color: 'hsl(var(--chart-3))',
  },
  Delivered: {
    label: 'Delivered',
    color: 'hsl(var(--chart-4))',
  },
  Claimed: {
    label: 'Claimed',
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
