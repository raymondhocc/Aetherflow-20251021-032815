export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type PipelineStatus = 'running' | 'stopped' | 'error' | 'starting';
export interface DataSource {
  id: string;
  name: string;
  type: 'AS400' | 'PostgreSQL' | 'MySQL' | 'MongoDB';
  lastSync: string;
  status: 'connected' | 'disconnected';
}
export interface DataDestination {
  id: string;
  name: string;
  type: 'Snowflake' | 'BigQuery' | 'Redshift' | 'Databricks';
  status: 'connected' | 'disconnected';
}
export interface Pipeline {
  id: string;
  name: string;
  sourceId: string;
  destinationId: string;
  status: PipelineStatus;
  dataIngested: number; // in MB
  lastActivity: string;
  transformationRules: string[];
  schedule: 'real-time' | 'hourly' | 'daily' | 'weekly';
}
export interface Metric {
  name: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
}
export interface DashboardMetrics {
  overview: Metric[];
  dataFlow: { time: string; volume: number }[];
  pipelineActivity: Pipeline[];
}