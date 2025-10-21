import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/ui/hero-section';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, Cloud, CheckCircle, XCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { DataDestination } from '@shared/types';
import { cn } from '@/lib/utils';
import { Toaster, toast } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DataDestinationForm } from '@/components/data-management/DataDestinationForm';
function DestinationCard({ destination, onEdit, onDelete, onTestConnection, isTesting }: { destination: DataDestination; onEdit: () => void; onDelete: () => void; onTestConnection: () => void; isTesting: boolean; }) {
  const isConnected = destination.status === 'connected';
  return (
    <Card className="flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex-row gap-4 items-start">
        <Cloud className="w-8 h-8 text-brand-accent mt-1" />
        <div className="flex-1">
          <CardTitle>{destination.name}</CardTitle>
          <CardDescription>{destination.type}</CardDescription>
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
          <span className={cn(isConnected ? 'text-green-600' : 'text-red-600', 'font-medium capitalize')}>{destination.status}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onTestConnection} disabled={isTesting}>
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
      </CardFooter>
    </Card>
  );
}
function DestinationCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row gap-4 items-center">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
export function DataDestinationsPage() {
  const [destinations, setDestinations] = useState<DataDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<DataDestination | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await api<DataDestination[]>('/api/data-destinations');
      setDestinations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data destinations.');
      toast.error('Failed to load data destinations.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDestinations();
  }, []);
  const handleOpenForm = (destination: DataDestination | null = null) => {
    setEditingDestination(destination);
    setIsFormOpen(true);
  };
  const handleFormSubmit = async (values: { name: string; type: DataDestination['type'] }) => {
    setIsSubmitting(true);
    try {
      if (editingDestination) {
        const updated = await api<DataDestination>(`/api/data-destinations/${editingDestination.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
        setDestinations(destinations.map((d) => (d.id === updated.id ? updated : d)));
        toast.success('Data destination updated successfully!');
      } else {
        const newDestination = await api<DataDestination>('/api/data-destinations', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        setDestinations([...destinations, newDestination]);
        toast.success('Data destination created successfully!');
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteDestination = async (destinationId: string) => {
    if (!confirm('Are you sure you want to delete this data destination?')) return;
    try {
      await api(`/api/data-destinations/${destinationId}`, { method: 'DELETE' });
      setDestinations(destinations.filter((d) => d.id !== destinationId));
      toast.success('Data destination deleted successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete data destination.');
    }
  };
  const handleTestConnection = async (destinationId: string) => {
    setTestingId(destinationId);
    toast.info('Testing connection...');
    try {
      await api(`/api/data-destinations/${destinationId}/test`, { method: 'POST' });
      toast.success('Connection test successful!');
      await fetchDestinations();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connection test failed.');
    } finally {
      setTestingId(null);
    }
  };
  return (
    <AppLayout>
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      <main>
        <HeroSection
          title="Manage Data Destinations"
          subtitle="Configure your data lakehouse environments. Define connection details, specify target locations, and manage credentials."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16 lg:py-20 space-y-12">
            <SectionHeader title="Your Data Destinations" description="All configured data destinations are listed below.">
              <Button onClick={() => handleOpenForm()} className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-glow transition-all duration-300 hover:scale-105 active:scale-95">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Destination
              </Button>
            </SectionHeader>
            {error && <div className="text-center text-red-500">{error}</div>}
            {!error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <DestinationCardSkeleton key={i} />)
                ) : destinations.length > 0 ? (
                  destinations.map((dest) => (
                    <DestinationCard
                      key={dest.id}
                      destination={dest}
                      onEdit={() => handleOpenForm(dest)}
                      onDelete={() => handleDeleteDestination(dest.id)}
                      onTestConnection={() => handleTestConnection(dest.id)}
                      isTesting={testingId === dest.id}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                    <Cloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">No data destinations found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new data destination.</p>
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
            <DialogTitle>{editingDestination ? 'Edit Data Destination' : 'Add New Data Destination'}</DialogTitle>
            <DialogDescription>
              {editingDestination ? 'Update the details for your data destination.' : 'Provide the details for your new data destination.'}
            </DialogDescription>
          </DialogHeader>
          <DataDestinationForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingDestination} />
        </DialogContent>
      </Dialog>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}