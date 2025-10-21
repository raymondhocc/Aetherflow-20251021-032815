import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { DashboardMetrics, Metric } from '@shared/types';
import { ArrowUpRight, ArrowDownRight, Activity, Database, Zap, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { useInterval } from 'react-use';
const iconMap = {
  'Total Pipelines': <Zap className="h-6 w-6 text-muted-foreground" />,
  'Active Pipelines': <Activity className="h-6 w-6 text-muted-foreground" />,
  'Data Ingested (Total)': <Database className="h-6 w-6 text-muted-foreground" />,
  'Errors': <AlertTriangle className="h-6 w-6 text-muted-foreground" />,
};
function MetricCard({ metric }: { metric: Metric }) {
  const Icon = iconMap[metric.name as keyof typeof iconMap] || <Zap className="h-6 w-6 text-muted-foreground" />;
  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.name}</CardTitle>
        {Icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        {metric.change && (
          <p className="text-xs text-muted-foreground flex items-center">
            <span className={cn(
              "flex items-center gap-1",
              metric.changeType === 'increase' ? 'text-emerald-500' : 'text-red-500'
            )}>
              {metric.changeType === 'increase' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {metric.change}
            </span>
            <span className="ml-1">from last 24h</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  );
}
export function DashboardOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const fetchMetrics = async () => {
    try {
      const data = await api<DashboardMetrics>('/api/dashboard-metrics');
      if (isMounted.current) {
        setMetrics(data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    isMounted.current = true;
    fetchMetrics();
    return () => {
      isMounted.current = false;
    };
  }, []);
  useInterval(fetchMetrics, 5000); // Poll every 5 seconds
  if (error && loading) { // Only show error if initial load fails
    return <div className="text-red-500">Error: {error}</div>;
  }
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          metrics?.overview?.map((metric) => <MetricCard key={metric.name} metric={metric} />)
        )}
      </div>
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Data Flow Volume (Simulated)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.dataFlow || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Volume (MB)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#3B82F6" fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}