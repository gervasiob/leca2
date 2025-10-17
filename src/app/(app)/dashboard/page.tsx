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
import { PageHeader } from '@/components/page-header';
import { clients, orderDetails, orders, claims } from '@/lib/data';
import { SalesChart } from './sales-chart';
import { StatusChart } from './status-chart';
import { DollarSign, Users, Package, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const recentActivities = orderDetails.slice(0, 5);

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        title="Dashboard"
        description="An overview of your factory's performance."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              +1 since last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                orderDetails.filter(
                  (od) =>
                    od.status === 'pending' || od.status === 'produced'
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {orderDetails.filter((od) => od.status === 'pending').length} pending, {orderDetails.filter((od) => od.status === 'produced').length} in production
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Claims</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claims.filter((c) => c.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Immediate attention required
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>
              Distribution of current order statuses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart />
          </CardContent>
        </Card>
      </div>
       <Card className="mt-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A log of the most recent order updates.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentActivities.map(activity => (
                        <TableRow key={activity.id}>
                            <TableCell className="font-medium">#{activity.orderId}</TableCell>
                            <TableCell>{activity.productName}</TableCell>
                            <TableCell><Badge variant="outline">{activity.status}</Badge></TableCell>
                            <TableCell>{format(activity.productionDate || new Date(), 'PPP')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
    </div>
  );
}
