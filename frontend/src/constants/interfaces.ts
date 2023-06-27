import { IReqoreIconName } from '@qoretechnologies/reqore/dist/types/icons';
import { keys } from 'lodash';

export const interfaceKindTransform = {
  'service-methods': 'service',
  step: 'step',
  'mapper-methods': 'mapper-code',
  error: 'errors',
  errors: 'errors',
  workflow: 'workflow',
  service: 'service',
  job: 'job',
  'mapper-code': 'mapper-code',
  mapper: 'mapper',
  group: 'group',
  event: 'event',
  'sync-event': 'sync-event',
  queue: 'queue',
  connection: 'connection',
  fsm: 'fsm',
  pipeline: 'pipeline',
  'value-map': 'value-map',
  type: 'type',
  class: 'class',
  'schema-modules': 'schema-modules',
  scripts: 'scripts',
  tests: 'tests',
};

export const interfaceToPlural = {
  service: 'services',
  step: 'steps',
  'mapper-code': 'mapper-codes',
  errors: 'errors',
  workflow: 'workflows',
  job: 'jobs',
  mapper: 'mappers',
  group: 'groups',
  event: 'events',
  'sync-event': 'sync-events',
  queue: 'queues',
  connection: 'connections',
  fsm: 'fsms',
  pipeline: 'pipelines',
  'value-map': 'valuemaps',
  type: 'types',
  class: 'classes',
  'schema-modules': 'schema-modules',
  scripts: 'scripts',
  tests: 'tests',
};

export const viewsIcons: Record<string, IReqoreIconName> = {
  ProjectConfig: 'Home3Fill',
  Interfaces: 'FileList2Line',
  SourceDirs: 'FolderAddLine',
  ReleasePackage: 'CodeBoxLine',
};

export const interfaceIcons: Record<string, IReqoreIconName> = {
  service: 'ServerLine',
  step: 'StickyNoteLine',
  'mapper-code': 'FunctionLine',
  errors: 'ErrorWarningLine',
  workflow: 'GitBranchLine',
  job: 'CalendarLine',
  mapper: 'MindMap',
  group: 'GridFill',
  event: 'GitCommitLine',
  'sync-event': 'GitCommitLine',
  queue: 'StackLine',
  connection: 'Plug2Line',
  fsm: 'DashboardLine',
  pipeline: 'NodeTree',
  'value-map': 'BringToFront',
  type: 'Asterisk',
  class: 'CodeSLine',
  'schema-modules': 'Database2Line',
  scripts: 'FileCodeLine',
  tests: 'FilterLine',
};

export const interfaceNameToKind = {
  Service: 'service',
  Step: 'step',
  'Mapper Code': 'mapper-code',
  Errors: 'errors',
  Workflow: 'workflow',
  Job: 'job',
  Mapper: 'mapper',
  Group: 'group',
  Event: 'event',
  'Sync Event': 'sync-event',
  Queue: 'queue',
  Connection: 'connection',
  'Flow Builder': 'fsm',
  Pipeline: 'pipeline',
  'Value Map': 'value-map',
  Type: 'type',
  Class: 'class',
  'Schema Module': 'schema-modules',
  Script: 'scripts',
  Test: 'tests',
};

// Reverse the interfaceNameToKind object
export const interfaceKindToName = keys(interfaceNameToKind).reduce((acc, key) => {
  acc[interfaceNameToKind[key]] = key;
  return acc;
}, {});
