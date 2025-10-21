import { IndexedEntity } from "./core-utils";
import type { DataSource, DataDestination, Pipeline } from "@shared/types";
import { MOCK_DATA_SOURCES, MOCK_DATA_DESTINATIONS, MOCK_PIPELINES } from "@shared/mock-data";
// AETHERFLOW ENTITIES
export class DataSourceEntity extends IndexedEntity<DataSource> {
  static readonly entityName = "dataSource";
  static readonly indexName = "dataSources";
  static readonly initialState: DataSource = { id: "", name: "", type: "AS400", lastSync: "", status: "disconnected" };
  static seedData = MOCK_DATA_SOURCES;
}
export class DataDestinationEntity extends IndexedEntity<DataDestination> {
  static readonly entityName = "dataDestination";
  static readonly indexName = "dataDestinations";
  static readonly initialState: DataDestination = { id: "", name: "", type: "Databricks", status: "disconnected" };
  static seedData = MOCK_DATA_DESTINATIONS;
}
export class PipelineEntity extends IndexedEntity<Pipeline> {
  static readonly entityName = "pipeline";
  static readonly indexName = "pipelines";
  static readonly initialState: Pipeline = { id: "", name: "", sourceId: "", destinationId: "", status: "stopped", dataIngested: 0, lastActivity: "", transformationRules: [], schedule: 'real-time' };
  static seedData = MOCK_PIPELINES;
}