const packageJson = require('../package.json');

import { DataQuery, DataSourceJsonData } from '@grafana/data';
import {
  QueryEditorPropertyExpression,
  QueryEditorArrayExpression,
  QueryEditorExpressionType,
  QueryEditorOperatorExpression,
} from './editor/expressions';

export interface QueryExpression {
  from?: QueryEditorPropertyExpression;
  where: QueryEditorArrayExpression;
  reduce: QueryEditorArrayExpression;
  groupBy: QueryEditorArrayExpression;
  timeshift?: QueryEditorPropertyExpression;
}

type QuerySource = 'raw' | 'schema' | 'autocomplete' | 'visual';
export interface KustoQuery extends DataQuery {
  query: string;
  database: string;
  alias?: string;
  resultFormat: string;
  expression: QueryExpression;
  rawMode?: boolean;
  querySource: QuerySource;
  pluginVersion: string;
}

export interface AutoCompleteQuery {
  database: string;
  search: QueryEditorOperatorExpression;
  expression: QueryExpression;
  index: string;
}

export enum EditorMode {
  Visual = 'visual',
  Raw = 'raw',
}

export const defaultQuery: Pick<KustoQuery, 'query' | 'expression' | 'querySource' | 'pluginVersion'> = {
  query: '',
  querySource: EditorMode.Raw,
  expression: {
    where: {
      type: QueryEditorExpressionType.And,
      expressions: [],
    },
    groupBy: {
      type: QueryEditorExpressionType.And,
      expressions: [],
    },
    reduce: {
      type: QueryEditorExpressionType.And,
      expressions: [],
    },
  },
  pluginVersion: packageJson.version,
};

export interface SchemaMapping {
  type: SchemaMappingType;
  value: string;
  name: string;
  database: string;
  displayName: string;
}

export interface SchemaMappingOption {
  label: string;
  value: string;
  type: SchemaMappingType;
  name: string;
  database: string;
  input?: AdxFunctionInputParameterSchema[];
}

export enum SchemaMappingType {
  function = 'function',
  table = 'table',
  materializedView = 'materializedView',
}
export interface AdxDataSourceOptions extends DataSourceJsonData {
  azureCloud?: AzureCloudType;
  defaultDatabase: string;
  minimalCache: number;
  defaultEditorMode: EditorMode;
  queryTimeout: string;
  dataConsistency: string;
  cacheMaxAge: string;
  dynamicCaching: boolean;
  useSchemaMapping: boolean;
  schemaMappings?: Array<Partial<SchemaMapping>>;
  enableUserTracking: boolean;
  clusterUrl: string;
  tenantId: string;
  clientId: string;
  onBehalfOf: boolean;
  oauthPassThru: boolean; // required for onBehalfOf
}

export interface AdxDataSourceSecureOptions {
  clientSecret: string | false;
}

export interface AdxSchema {
  Databases: Record<string, AdxDatabaseSchema>;
}

export interface AdxDatabaseSchema {
  Name: string;
  Tables: Record<string, AdxTableSchema>;
  ExternalTables: Record<string, AdxTableSchema>;
  Functions: Record<string, AdxFunctionSchema>;
  MaterializedViews: Record<string, AdxTableSchema>;
}

export interface AdxTableSchema {
  Name: string;
  OrderedColumns: AdxColumnSchema[];
}

export interface AdxColumnSchema {
  Name: string;
  CslType: string;
}

export interface AdxFunctionSchema {
  Body: string;
  FunctionKind: string;
  Name: string;
  InputParameters: AdxFunctionInputParameterSchema[];
  OutputColumns: AdxColumnSchema[];
}

export interface AdxFunctionInputParameterSchema extends AdxColumnSchema {}

// must be in synch with clouds.go
export enum AzureCloudType {
  AzurePublic = 'azuremonitor',
  AzureUSGovernment = 'govazuremonitor',
  AzureChina = 'chinaazuremonitor',
}
