'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { handleGenerateClaimMessage } from './actions';
import type { OrderDetail } from '@/lib/types';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const claimFormSchema = z.object({
  orderDetailId: z.string().min(1, 'Please select an order item.'),
  claimDetails: z.string().min(10, 'Please provide at least 10 characters.'),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

interface ClaimFormProps {
  allOrderDetails: OrderDetail[];
}

export function ClaimForm({ allOrderDetails }: ClaimFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [generatedMessage, setGeneratedMessage] = useState('');

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      orderDetailId: '',
      claimDetails: '',
    },
  });

  const selectedOrderDetailId = form.watch('orderDetailId');
  const selectedOrderDetail = selectedOrderDetailId
    ? allOrderDetails.find((d) => d.id === parseInt(selectedOrderDetailId, 10))
    : null;

  const onSubmit = (values: ClaimFormValues) => {
    if (!selectedOrderDetail) {
      toast({
        title: 'Error',
        description: 'Could not find the selected order detail.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const result = await handleGenerateClaimMessage({
        orderDetailId: selectedOrderDetail.id,
        clientName: allOrderDetails.find(od => od.clientId === selectedOrderDetail.clientId)?.productName || 'Valued Customer',
        productName: selectedOrderDetail.productName,
        quantity: selectedOrderDetail.quantity,
        status: selectedOrderDetail.status,
        claimDetails: values.claimDetails,
      });

      if (result.success && result.message) {
        setGeneratedMessage(result.message);
        toast({
          title: 'Success',
          description: 'Claim message generated successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Generate Claim Message</CardTitle>
            <CardDescription>
              Use AI to generate a professional response to a customer claim.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="orderDetailId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Item</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an order item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allOrderDetails.map((detail) => (
                        <SelectItem
                          key={detail.id}
                          value={detail.id.toString()}
                        >
                          #{detail.orderId}-{detail.id}: {detail.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="claimDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claim Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., The customer reports the paint color is a shade lighter than ordered..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {generatedMessage && (
                <FormItem>
                    <FormLabel>Generated Message</FormLabel>
                    <Textarea readOnly value={generatedMessage} rows={5} className="bg-muted/50" />
                </FormItem>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Message
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
