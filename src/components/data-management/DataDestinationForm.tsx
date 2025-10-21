import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import type { DataDestination } from '@shared/types';
const dataDestinationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  type: z.enum(['Snowflake', 'BigQuery', 'Redshift', 'Databricks']),
});
type DataDestinationFormValues = z.infer<typeof dataDestinationSchema>;
interface DataDestinationFormProps {
  onSubmit: (values: DataDestinationFormValues) => void;
  isSubmitting: boolean;
  initialData?: DataDestination | null;
}
export function DataDestinationForm({ onSubmit, isSubmitting, initialData }: DataDestinationFormProps) {
  const form = useForm<DataDestinationFormValues>({
    resolver: zodResolver(dataDestinationSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'Databricks',
    },
  });
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        type: initialData.type,
      });
    }
  }, [initialData, form]);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Analytics Lakehouse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a destination type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Databricks">Databricks</SelectItem>
                  <SelectItem value="Snowflake">Snowflake</SelectItem>
                  <SelectItem value="BigQuery">BigQuery</SelectItem>
                  <SelectItem value="Redshift">Redshift</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-brand hover:bg-brand/90 text-brand-foreground">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Destination'}
          </Button>
        </div>
      </form>
    </Form>
  );
}