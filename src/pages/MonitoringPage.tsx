import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/ui/hero-section';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useInterval } from 'react-use';
import { api } from '@/lib/api-client';
import type { Pipeline } from '@shared/types';
const generateInitialChartData = () => {
  const data = [];
  const now = new Date();
  for (let i = 10; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60000);
    data.push({
      name: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      throughput: 0,
      latency: 0,
    });
  }
  return data;
};
const generateActivityLog = (pipelines: Pipeline[]) => {
  const runningPipelines = pipelines.filter(p => p.status === 'running');
  if (runningPipelines.length === 0) return [];
  const logLevels = ['info', 'info', 'info', 'warn', 'error'];
  const logMessages = {
    info: ['records ingested.', 'Batch processing complete.', 'Heartbeat check OK.'],
    warn: ['Latency high:', 'Schema change detected in source table.'],
    error: ['Connection to destination failed: timeout.', 'Data validation failed for batch.'],
  };
  const newLogCount = Math.floor(Math.random() * 3);
  const newLogs = [];
  for (let i = 0; i < newLogCount; i++) {
    const pipeline = runningPipelines[Math.floor(Math.random() * runningPipelines.length)];
    const level = logLevels[Math.floor(Math.random() * logLevels.length)];
    let message = logMessages[level as keyof typeof logMessages][Math.floor(Math.random() * logMessages[level as keyof typeof logMessages].length)];
    if (message.includes('records ingested')) {
      message = `${Math.floor(Math.random() * 2000)} ${message}`;
    }
    if (message.includes('Latency high')) {
      message = `${message} ${Math.floor(Math.random() * 300)}ms.`;
    }
    newLogs.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      pipeline: pipeline.name,
      level,
      message,
    });
  }
  return newLogs;
};
const levelBadgeStyles: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
  warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800/60',
};
export function MonitoringPage() {
  const [chartData, setChartData] = useState(generateInitialChartData());
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const isMounted = useRef(true);
  const updateData = async () => {
    try {
      const pipelines = await api<Pipeline[]>('/api/pipelines');
      if (!isMounted.current) return;
      const runningPipelines = pipelines.filter(p => p.status === 'running');
      const hasActivePipelines = runningPipelines.length > 0;
      setChartData(prevData => {
        const newData = [...prevData.slice(1)];
        const now = new Date();
        newData.push({
          name: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          throughput: hasActivePipelines ? Math.floor(Math.random() * 3000 + 1500) : Math.floor(Math.random() * 100),
          latency: hasActivePipelines ? Math.floor(Math.random() * 110 + 10) : Math.floor(Math.random() * 10),
        });
        return newData;
      });
      const newLogs = generateActivityLog(pipelines);
      if (newLogs.length > 0) {
        setActivityLog(prevLogs => [...newLogs, ...prevLogs].slice(0, 50));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update monitoring data.');
    }
  };
  useEffect(() => {
    isMounted.current = true;
    updateData(); // Initial fetch
    return () => {
      isMounted.current = false;
    };
  }, []);
  useInterval(updateData, 5000); // Update every 5 seconds
  return (
    <AppLayout>
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      <main>
        <HeroSection
          title="Real-time Monitoring"
          subtitle="Gain live visibility into pipeline performance and health. View metrics, inspect logs, and configure alerts for proactive issue detection."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16 lg:py-20 space-y-12">
            <SectionHeader title="Live Performance Metrics" />
            <Card>
              <CardHeader>
                <CardTitle>Throughput & Latency (Simulated)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" label={{ value: 'Throughput (records/s)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Latency (ms)', angle: -90, position: 'insideRight' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="throughput" stroke="#3B82F6" fill="url(#colorThroughput)" strokeWidth={2} />
                      <Area yAxisId="right" type="monotone" dataKey="latency" stroke="#10B981" fill="url(#colorLatency)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <SectionHeader title="Activity Log" />
            <Card>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Pipeline</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLog.length > 0 ? (
                        activityLog.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            <TableCell className="font-medium">{log.pipeline}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={levelBadgeStyles[log.level]}>{log.level}</Badge>
                            </TableCell>
                            <TableCell>{log.message}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            No activity to display. Start a pipeline to generate logs.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}