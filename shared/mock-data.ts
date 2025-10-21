import type { DataSource, DataDestination, Pipeline, DashboardMetrics } from './types';
export const MOCK_DATA_SOURCES: DataSource[] = [
  { id: 'ds-1', name: 'AS400 Mainframe', type: 'AS400', lastSync: new Date().toISOString(), status: 'connected' },
  { id: 'ds-2', name: 'Sales DB', type: 'PostgreSQL', lastSync: new Date(Date.now() - 86400000).toISOString(), status: 'connected' },
  { id: 'ds-3', name: 'Inventory System', type: 'MySQL', lastSync: new Date(Date.now() - 172800000).toISOString(), status: 'disconnected' },
];
export const MOCK_DATA_DESTINATIONS: DataDestination[] = [
  { id: 'dd-1', name: 'Primary Lakehouse', type: 'Databricks', status: 'connected' },
  { id: 'dd-2', name: 'Analytics Warehouse', type: 'Snowflake', status: 'connected' },
  { id: 'dd-3', name: 'Marketing Datamart', type: 'BigQuery', status: 'disconnected' },
];
export const MOCK_PIPELINES: Pipeline[] = [
  { id: 'pl-1', name: 'AS400 to Lakehouse Sync', sourceId: 'ds-1', destinationId: 'dd-1', status: 'running', dataIngested: 1280, lastActivity: new Date().toISOString(), transformationRules: ['Filter: status=active', 'Map: user_id to customer_id'], schedule: 'real-time' },
  { id: 'pl-2', name: 'Sales Data Replication', sourceId: 'ds-2', destinationId: 'dd-2', status: 'running', dataIngested: 540, lastActivity: new Date().toISOString(), transformationRules: [], schedule: 'hourly' },
  { id: 'pl-3', name: 'Inventory Nightly Batch', sourceId: 'ds-3', destinationId: 'dd-1', status: 'stopped', dataIngested: 2300, lastActivity: new Date(Date.now() - 86400000).toISOString(), transformationRules: ['Anonymize: PII fields'], schedule: 'daily' },
  { id: 'pl-4', name: 'Real-time Orders', sourceId: 'ds-1', destinationId: 'dd-2', status: 'error', dataIngested: 75, lastActivity: new Date(Date.now() - 3600000).toISOString(), transformationRules: [], schedule: 'real-time' },
  { id: 'pl-5', name: 'Marketing Data Weekly', sourceId: 'ds-2', destinationId: 'dd-3', status: 'stopped', dataIngested: 950, lastActivity: new Date(Date.now() - 86400000 * 3).toISOString(), transformationRules: ['Filter: campaign=active', 'Map: lead_id to prospect_id'], schedule: 'weekly' },
];
export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  overview: [
    { name: 'Total Pipelines', value: MOCK_PIPELINES.length, change: '+2', changeType: 'increase' },
    { name: 'Active Pipelines', value: MOCK_PIPELINES.filter(p => p.status === 'running').length, change: '+1', changeType: 'increase' },
    { name: 'Data Ingested (24h)', value: '1.8 TB', change: '+15%', changeType: 'increase' },
    { name: 'Errors (24h)', value: 1, change: '-3', changeType: 'decrease' },
  ],
  dataFlow: [
    { time: '12:00 AM', volume: 120 },
    { time: '03:00 AM', volume: 150 },
    { time: '06:00 AM', volume: 250 },
    { time: '09:00 AM', volume: 220 },
    { time: '12:00 PM', volume: 300 },
    { time: '03:00 PM', volume: 280 },
    { time: '06:00 PM', volume: 450 },
    { time: '09:00 PM', volume: 350 },
  ],
  pipelineActivity: MOCK_PIPELINES,
};