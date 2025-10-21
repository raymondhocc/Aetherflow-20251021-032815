import { Hono } from "hono";
import type { Env } from './core-utils';
import { DataSourceEntity, DataDestinationEntity, PipelineEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { DataSource, DataDestination, Pipeline } from "@shared/types";
// Simulate data ingestion rate in MB per second
const INGESTION_RATE_MB_PER_SEC = 0.5;
// Helper to calculate simulated data ingestion for running pipelines
const calculateSimulatedData = (pipeline: Pipeline): Pipeline => {
  if (pipeline.status === 'running') {
    const now = Date.now();
    const lastActivityTime = new Date(pipeline.lastActivity).getTime();
    const elapsedSeconds = (now - lastActivityTime) / 1000;
    if (elapsedSeconds > 0) {
      const newlyIngested = elapsedSeconds * INGESTION_RATE_MB_PER_SEC;
      const totalIngested = (pipeline.dataIngested || 0) + newlyIngested;
      return {
        ...pipeline,
        dataIngested: parseFloat(totalIngested.toFixed(2)),
        lastActivity: new Date(now).toISOString(),
      };
    }
  }
  return pipeline;
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // AETHERFLOW ROUTES
  app.get('/api/dashboard-metrics', async (c) => {
    const pipelinesPage = await PipelineEntity.list(c.env);
    let pipelines = pipelinesPage.items;
    // Apply simulation logic before calculating metrics
    pipelines = pipelines.map(calculateSimulatedData);
    const totalPipelines = pipelines.length;
    const runningPipelines = pipelines.filter(p => p.status === 'running').length;
    const errorPipelines = pipelines.filter(p => p.status === 'error').length;
    const totalDataIngested = pipelines.reduce((sum, p) => sum + (p.dataIngested || 0), 0);
    // Mock data for charts
    const dataFlow = Array.from({ length: 8 }, (_, i) => {
      const baseTime = new Date();
      baseTime.setHours(baseTime.getHours() - (7-i) * 3, 0, 0, 0);
      return {
        time: baseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        volume: runningPipelines > 0 ? Math.floor(Math.random() * 300 + 200) : Math.floor(Math.random() * 50),
      };
    });
    return ok(c, {
      overview: [
        { name: 'Total Pipelines', value: totalPipelines },
        { name: 'Active Pipelines', value: runningPipelines },
        { name: 'Data Ingested (Total)', value: `${totalDataIngested.toFixed(2)} MB` },
        { name: 'Errors', value: errorPipelines },
      ],
      dataFlow,
    });
  });
  // Data Sources CRUD
  app.get('/api/data-sources', async (c) => {
    await DataSourceEntity.ensureSeed(c.env);
    const page = await DataSourceEntity.list(c.env);
    return ok(c, page.items);
  });
  app.post('/api/data-sources', async (c) => {
    const { name, type } = await c.req.json<Partial<DataSource>>();
    if (!isStr(name) || !isStr(type)) return bad(c, 'Name and type are required');
    const newSource: DataSource = {
      id: crypto.randomUUID(),
      name,
      type: type as DataSource['type'],
      status: 'disconnected',
      lastSync: new Date().toISOString(),
    };
    const created = await DataSourceEntity.create(c.env, newSource);
    return ok(c, created);
  });
  app.put('/api/data-sources/:id', async (c) => {
    const id = c.req.param('id');
    const { name, type } = await c.req.json<Partial<DataSource>>();
    if (!isStr(name) || !isStr(type)) return bad(c, 'Name and type are required');
    const entity = new DataSourceEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Data source not found');
    const currentState = await entity.getState();
    const updatedState: DataSource = { ...currentState, name, type: type as DataSource['type'] };
    await entity.save(updatedState);
    return ok(c, updatedState);
  });
  app.delete('/api/data-sources/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await DataSourceEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Data source not found');
    return ok(c, { id, deleted });
  });
  app.post('/api/data-sources/:id/test', async (c) => {
    const id = c.req.param('id');
    const entity = new DataSourceEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Data source not found');
    return ok(c, { success: true, message: 'Connection successful' });
  });
  // Data Destinations CRUD
  app.get('/api/data-destinations', async (c) => {
    await DataDestinationEntity.ensureSeed(c.env);
    const page = await DataDestinationEntity.list(c.env);
    return ok(c, page.items);
  });
  app.post('/api/data-destinations', async (c) => {
    const { name, type } = await c.req.json<Partial<DataDestination>>();
    if (!isStr(name) || !isStr(type)) return bad(c, 'Name and type are required');
    const newDestination: DataDestination = {
      id: crypto.randomUUID(),
      name,
      type: type as DataDestination['type'],
      status: 'disconnected',
    };
    const created = await DataDestinationEntity.create(c.env, newDestination);
    return ok(c, created);
  });
  app.put('/api/data-destinations/:id', async (c) => {
    const id = c.req.param('id');
    const { name, type } = await c.req.json<Partial<DataDestination>>();
    if (!isStr(name) || !isStr(type)) return bad(c, 'Name and type are required');
    const entity = new DataDestinationEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Data destination not found');
    const currentState = await entity.getState();
    const updatedState: DataDestination = { ...currentState, name, type: type as DataDestination['type'] };
    await entity.save(updatedState);
    return ok(c, updatedState);
  });
  app.delete('/api/data-destinations/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await DataDestinationEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Data destination not found');
    return ok(c, { id, deleted });
  });
  app.post('/api/data-destinations/:id/test', async (c) => {
    const id = c.req.param('id');
    const entity = new DataDestinationEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Data destination not found');
    return ok(c, { success: true, message: 'Connection successful' });
  });
  // Pipelines CRUD
  app.get('/api/pipelines', async (c) => {
    await PipelineEntity.ensureSeed(c.env);
    const page = await PipelineEntity.list(c.env);
    const simulatedPipelines = page.items.map(calculateSimulatedData);
    return ok(c, simulatedPipelines);
  });
  app.post('/api/pipelines', async (c) => {
    const { name, sourceId, destinationId, transformationRules, schedule } = await c.req.json<Partial<Pipeline>>();
    if (!isStr(name) || !isStr(sourceId) || !isStr(destinationId)) {
      return bad(c, 'Name, sourceId, and destinationId are required');
    }
    const newPipeline: Pipeline = {
      id: crypto.randomUUID(),
      name,
      sourceId,
      destinationId,
      status: 'stopped',
      dataIngested: 0,
      lastActivity: new Date().toISOString(),
      transformationRules: transformationRules || [],
      schedule: schedule || 'real-time',
    };
    const created = await PipelineEntity.create(c.env, newPipeline);
    return ok(c, created);
  });
  app.put('/api/pipelines/:id', async (c) => {
    const id = c.req.param('id');
    const { name, sourceId, destinationId, transformationRules, schedule } = await c.req.json<Partial<Pipeline>>();
    if (!isStr(name) || !isStr(sourceId) || !isStr(destinationId)) {
      return bad(c, 'Name, sourceId, and destinationId are required');
    }
    const entity = new PipelineEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Pipeline not found');
    const currentState = await entity.getState();
    const updatedState: Pipeline = {
      ...currentState,
      name,
      sourceId,
      destinationId,
      transformationRules: transformationRules ?? currentState.transformationRules,
      schedule: schedule ?? currentState.schedule,
    };
    await entity.save(updatedState);
    return ok(c, updatedState);
  });
  app.delete('/api/pipelines/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await PipelineEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Pipeline not found');
    return ok(c, { id, deleted });
  });
  // Pipeline Actions
  app.post('/api/pipelines/:id/start', async (c) => {
    const id = c.req.param('id');
    const entity = new PipelineEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Pipeline not found');
    const currentState = await entity.getState();
    // If it was already running, just return current state.
    if (currentState.status === 'running') return ok(c, currentState);
    // Persist the final state from the last run before starting again
    const finalState = calculateSimulatedData(currentState);
    await entity.save({ ...finalState, status: 'running', lastActivity: new Date().toISOString() });
    return ok(c, await entity.getState());
  });
  app.post('/api/pipelines/:id/stop', async (c) => {
    const id = c.req.param('id');
    const entity = new PipelineEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Pipeline not found');
    const currentState = await entity.getState();
    // If it was already stopped, just return current state.
    if (currentState.status === 'stopped') return ok(c, currentState);
    // Calculate final ingested data and persist it
    const finalState = calculateSimulatedData(currentState);
    await entity.save({ ...finalState, status: 'stopped', lastActivity: new Date().toISOString() });
    return ok(c, await entity.getState());
  });
}