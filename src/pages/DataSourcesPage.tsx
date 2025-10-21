import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/ui/hero-section';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, Database, CheckCircle, XCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { DataSource } from '@shared/types';
import { cn } from '@/lib/utils';
import { Toaster, toast } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DataSourceForm } from '@/components/data-management/DataSourceForm';
function DataSourceCard({ source, onEdit, onDelete, onTestConnection }: { source: DataSource; onEdit: () => void; onDelete: () => void; onTestConnection: () => void; }) {
  const isConnected = source.status === 'connected';
  return (
    <Card className="flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex-row gap-4 items-start">
        <Database className="w-8 h-8 text-brand mt-1" />
        <div className="flex-1">
          <CardTitle>{source.name}</CardTitle>
          <CardDescription>{source.type}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center space-x-2 text-sm">
          {isConnected ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
          <span className={cn(isConnected ? 'text-green-600' : 'text-red-600', 'font-medium capitalize')}>{source.status}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Last Sync: {new Date(source.lastSync).toLocaleString()}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onTestConnection}>Test Connection</Button>
      </CardFooter>
    </Card>
  );
}
function DataSourceCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row gap-4 items-center">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
export function DataSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchSources = async () => {
    try {
      setLoading(true);
      const data = await api<DataSource[]>('/api/data-sources');
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data sources.');
      toast.error('Failed to load data sources.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSources();
  }, []);
  const handleOpenForm = (source: DataSource | null = null) => {
    setEditingSource(source);
    setIsFormOpen(true);
  };
  const handleFormSubmit = async (values: { name: string; type: DataSource['type'] }) => {
    setIsSubmitting(true);
    try {
      if (editingSource) {
        const updatedSource = await api<DataSource>(`/api/data-sources/${editingSource.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
        setSources(sources.map((s) => (s.id === updatedSource.id ? updatedSource : s)));
        toast.success('Data source updated successfully!');
      } else {
        const newSource = await api<DataSource>('/api/data-sources', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        setSources([...sources, newSource]);
        toast.success('Data source created successfully!');
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this data source?')) return;
    try {
      await api(`/api/data-sources/${sourceId}`, { method: 'DELETE' });
      setSources(sources.filter((s) => s.id !== sourceId));
      toast.success('Data source deleted successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete data source.');
    }
  };
  const handleTestConnection = async (sourceId: string) => {
    toast.info(`Testing connection...`);
    try {
      // This is a mock API call, replace with your actual endpoint
      const result = await api<{ status: 'success' | 'error'; message: string }>(`/api/data-sources/${sourceId}/test`, {
        method: 'POST',
      });
      if (result.status === 'success') {
        toast.success(result.message || 'Connection successful!');
      } else {
        toast.error(result.message || 'Connection failed.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to test connection.');
    }
  };
  return (
    <AppLayout>
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      <main>
        <HeroSection
          title="Manage Data Sources"
          subtitle="Configure and manage connections to your various data sources. Add new sources, test connectivity, and view schemas."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16 lg:py-20 space-y-12">
            <SectionHeader title="Your Data Sources" description="All configured data sources are listed below.">
              <Button onClick={() => handleOpenForm()} className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-glow transition-all duration-300 hover:scale-105 active:scale-95">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Source
              </Button>
            </SectionHeader>
            {error && <div className="text-center text-red-500">{error}</div>}
            {!error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <DataSourceCardSkeleton key={i} />)
                ) : sources.length > 0 ? (
                  sources.map((source) => (
                    <DataSourceCard key={source.id} source={source} onEdit={() => handleOpenForm(source)} onDelete={() => handleDeleteSource(source.id)} onTestConnection={() => handleTestConnection(source.id)} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                    <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">No data sources found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new data source.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSource ? 'Edit Data Source' : 'Add New Data Source'}</DialogTitle>
            <DialogDescription>
              {editingSource ? 'Update the details for your data source.' : 'Provide the details for your new data source.'}
            </DialogDescription>
          </DialogHeader>
          <DataSourceForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingSource} />
        </DialogContent>
      </Dialog>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}