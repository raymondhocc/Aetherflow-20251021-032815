import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/ui/hero-section';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Play, Pause, AlertTriangle, ChevronsRight, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Pipeline, PipelineStatus, DataSource, DataDestination } from '@shared/types';
import { cn } from '@/lib/utils';
import { Toaster, toast } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PipelineForm } from '@/components/pipeline-management/PipelineForm';
import { pipelineSchema } from '@/components/pipeline-management/pipeline-schema';
const statusInfo: Record<PipelineStatus, { icon: React.ElementType, className: string }> = {
  running: { icon: Play, className: 'text-green-500' },
  stopped: { icon: Pause, className: 'text-gray-500' },
  error: { icon: AlertTriangle, className: 'text-red-500' },
  starting: { icon: ChevronsRight, className: 'text-blue-500 animate-pulse' },
};
const statusBadgeStyles: Record<PipelineStatus, string> = {
  running: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  stopped: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  starting: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
};
export function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [destinations, setDestinations] = useState<DataDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sourceMap = React.useMemo(() => new Map(sources.map(s => [s.id, s.name])), [sources]);
  const destinationMap = React.useMemo(() => new Map(destinations.map(d => [d.id, d.name])), [destinations]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [pipelinesData, sourcesData, destinationsData] = await Promise.all([
        api<Pipeline[]>('/api/pipelines'),
        api<DataSource[]>('/api/data-sources'),
        api<DataDestination[]>('/api/data-destinations'),
      ]);
      setPipelines(pipelinesData);
      setSources(sourcesData);
      setDestinations(destinationsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load page data.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleOpenForm = (pipeline: Pipeline | null = null) => {
    setEditingPipeline(pipeline);
    setIsFormOpen(true);
  };
  const handleFormSubmit = async (values: Omit<z.infer<typeof pipelineSchema>, 'transformationRules'> & { transformationRules: string[] }) => {
    setIsSubmitting(true);
    try {
      if (editingPipeline) {
        const updated = await api<Pipeline>(`/api/pipelines/${editingPipeline.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
        setPipelines(pipelines.map((p) => (p.id === updated.id ? updated : p)));
        toast.success('Pipeline updated successfully!');
      } else {
        const newPipeline = await api<Pipeline>('/api/pipelines', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        setPipelines([...pipelines, newPipeline]);
        toast.success('Pipeline created successfully!');
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeletePipeline = async (pipelineId: string) => {
    if (!confirm('Are you sure you want to delete this pipeline?')) return;
    try {
      await api(`/api/pipelines/${pipelineId}`, { method: 'DELETE' });
      setPipelines(pipelines.filter((p) => p.id !== pipelineId));
      toast.success('Pipeline deleted successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete pipeline.');
    }
  };
  const handleStatusChange = async (pipelineId: string, action: 'start' | 'stop') => {
    const originalPipelines = [...pipelines];
    const optimisticUpdate = pipelines.map(p =>
      p.id === pipelineId
        ? { ...p, status: (action === 'start' ? 'starting' : 'stopped') as PipelineStatus }
        : p
    );
    setPipelines(optimisticUpdate);
    try {
      const updatedPipeline = await api<Pipeline>(`/api/pipelines/${pipelineId}/${action}`, { method: 'POST' });
      setPipelines(prev => prev.map(p => p.id === pipelineId ? updatedPipeline : p));
      toast.success(`Pipeline ${action === 'start' ? 'started' : 'stopped'} successfully.`);
    } catch (err) {
      setPipelines(originalPipelines);
      toast.error(err instanceof Error ? err.message : `Failed to ${action} pipeline.`);
    }
  };
  return (
    <AppLayout>
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      <main>
        <HeroSection
          title="Data Pipelines"
          subtitle="Create, manage, and deploy data ingestion pipelines. Define data flows, transformation rules, and scheduling options."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16 lg:py-20 space-y-12">
            <SectionHeader title="Your Pipelines" description="All configured pipelines are listed below.">
              <Button onClick={() => handleOpenForm()} className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-glow transition-all duration-300 hover:scale-105 active:scale-95">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Pipeline
              </Button>
            </SectionHeader>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source → Destination</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Rules</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-red-500 h-24">{error}</TableCell>
                        </TableRow>
                      ) : pipelines.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground h-24">No pipelines found.</TableCell>
                        </TableRow>
                      ) : (
                        pipelines.map((pipeline) => {
                          const StatusIcon = statusInfo[pipeline.status].icon;
                          return (
                            <TableRow key={pipeline.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell>
                                <StatusIcon className={cn("h-5 w-5", statusInfo[pipeline.status].className)} />
                              </TableCell>
                              <TableCell className="font-medium truncate max-w-xs">{pipeline.name}</TableCell>
                              <TableCell>
                                <Badge className={cn("capitalize", statusBadgeStyles[pipeline.status])}>{pipeline.status}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="truncate max-w-[200px]">{sourceMap.get(pipeline.sourceId) || pipeline.sourceId}</span>
                                  <span className="text-muted-foreground text-xs truncate max-w-[200px]">→ {destinationMap.get(pipeline.destinationId) || pipeline.destinationId}</span>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{pipeline.schedule.replace('-', ' ')}</TableCell>
                              <TableCell>{pipeline.transformationRules.length > 0 ? `${pipeline.transformationRules.length} rule(s)` : 'None'}</TableCell>
                              <TableCell>
                                <div className="flex justify-end">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {pipeline.status !== 'running' && (
                                        <DropdownMenuItem onClick={() => handleStatusChange(pipeline.id, 'start')}>
                                          <Play className="mr-2 h-4 w-4" /> Start
                                        </DropdownMenuItem>
                                      )}
                                      {pipeline.status === 'running' && (
                                        <DropdownMenuItem onClick={() => handleStatusChange(pipeline.id, 'stop')}>
                                          <Pause className="mr-2 h-4 w-4" /> Stop
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleOpenForm(pipeline)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDeletePipeline(pipeline.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPipeline ? 'Edit Pipeline' : 'Create New Pipeline'}</DialogTitle>
            <DialogDescription>
              {editingPipeline ? 'Update the details for your pipeline.' : 'Configure a new pipeline to start moving data.'}
            </DialogDescription>
          </DialogHeader>
          <PipelineForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingPipeline} />
        </DialogContent>
      </Dialog>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}