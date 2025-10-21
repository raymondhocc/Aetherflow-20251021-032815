import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Pipeline, DataSource, DataDestination } from '@shared/types';
import { toast } from 'sonner';
import { pipelineSchema } from './pipeline-schema';
type PipelineFormValues = z.infer<typeof pipelineSchema>;
interface PipelineFormProps {
  onSubmit: (values: Omit<PipelineFormValues, 'transformationRules'> & { transformationRules: string[] }) => void;
  isSubmitting: boolean;
  initialData?: Pipeline | null;
}
export function PipelineForm({ onSubmit, isSubmitting, initialData }: PipelineFormProps) {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [destinations, setDestinations] = useState<DataDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const form = useForm<PipelineFormValues>({
    resolver: zodResolver(pipelineSchema),
    defaultValues: {
      name: initialData?.name || '',
      sourceId: initialData?.sourceId || '',
      destinationId: initialData?.destinationId || '',
      schedule: initialData?.schedule || 'real-time',
      transformationRules: initialData?.transformationRules?.join('\n') || '',
    },
  });
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [sourcesData, destinationsData] = await Promise.all([
          api<DataSource[]>('/api/data-sources'),
          api<DataDestination[]>('/api/data-destinations'),
        ]);
        setSources(sourcesData);
        setDestinations(destinationsData);
      } catch (error) {
        toast.error('Failed to load sources and destinations.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        sourceId: initialData.sourceId,
        destinationId: initialData.destinationId,
        schedule: initialData.schedule,
        transformationRules: initialData.transformationRules?.join('\n') || '',
      });
    }
  }, [initialData, form]);
  const handleFormSubmit = (values: PipelineFormValues) => {
    const rules = values.transformationRules ? values.transformationRules.split('\n').filter(rule => rule.trim() !== '') : [];
    const { transformationRules, ...rest } = values;
    onSubmit({ ...rest, transformationRules: rules });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pipeline Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Real-time Orders Sync" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sourceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Source</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading sources..." : "Select a data source"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sources.map(source => (
                    <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="destinationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Destination</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading destinations..." : "Select a data destination"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {destinations.map(dest => (
                    <SelectItem key={dest.id} value={dest.id}>{dest.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a schedule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="real-time">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transformationRules"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transformation Rules</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter one rule per line, e.g., Filter: status=active"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || loading} className="bg-brand hover:bg-brand/90 text-brand-foreground">
            {(isSubmitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Pipeline'}
          </Button>
        </div>
      </form>
    </Form>
  );
}