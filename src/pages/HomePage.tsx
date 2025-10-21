import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/ui/hero-section';
import { SectionHeader } from '@/components/ui/section-header';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Play, Pause } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Pipeline, PipelineStatus } from '@shared/types';
import { cn } from '@/lib/utils';
import { Toaster, toast } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useInterval } from 'react-use';
const statusStyles: Record<PipelineStatus, string> = {
  running: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  stopped: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  starting: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
};
function PipelineActivity() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const fetchPipelines = async () => {
    try {
      const data = await api<Pipeline[]>('/api/pipelines');
      if (isMounted.current) {
        setPipelines(data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load pipelines.');
        toast.error('Failed to load pipelines.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    isMounted.current = true;
    fetchPipelines();
    return () => {
      isMounted.current = false;
    };
  }, []);
  useInterval(fetchPipelines, 5000); // Poll every 5 seconds
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
      setPipelines(prevPipelines => prevPipelines.map(p => p.id === pipelineId ? updatedPipeline : p));
      toast.success(`Pipeline ${action === 'start' ? 'started' : 'stopped'} successfully.`);
    } catch (err) {
      setPipelines(originalPipelines);
      toast.error(err instanceof Error ? err.message : `Failed to ${action} pipeline.`);
    }
  };
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Recent Pipeline Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pipeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Data Ingested</TableHead>
              <TableHead className="hidden md:table-cell">Last Activity</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500">{error}</TableCell>
              </TableRow>
            ) : pipelines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No pipeline activity found.</TableCell>
              </TableRow>
            ) : (
              pipelines.slice(0, 5).map((pipeline) => (
                <TableRow key={pipeline.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{pipeline.name}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", statusStyles[pipeline.status])}>{pipeline.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{pipeline.dataIngested.toFixed(2)} MB</TableCell>
                  <TableCell className="hidden md:table-cell">{new Date(pipeline.lastActivity).toLocaleString()}</TableCell>
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
export function HomePage() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      <main>
        <HeroSection
          title={
            <>
              AetherFlow: Real-time <span className="text-gradient-brand">Data Intelligence</span>
            </>
          }
          subtitle="Seamlessly ingest, transform, and analyze data from AS400 to your lakehouse, empowering your LLMs with fresh, actionable insights."
          actions={
            <>
              <Button size="lg" className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-glow transition-all duration-300 hover:scale-105 active:scale-95" onClick={() => navigate('/pipelines')}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Pipeline
              </Button>
              <Button size="lg" variant="outline" className="transition-all duration-300 hover:scale-105 active:scale-95" onClick={() => navigate('/docs')}>
                View Documentation
              </Button>
            </>
          }
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16 lg:py-20 space-y-12">
            <SectionHeader title="Dashboard Overview" />
            <DashboardOverview />
            <SectionHeader title="Pipeline Status" />
            <PipelineActivity />
          </div>
        </div>
      </main>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}