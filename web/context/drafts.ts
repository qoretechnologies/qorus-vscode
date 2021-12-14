import { createContext } from 'react';
import { IClassConnections } from '../containers/ClassConnectionsManager';
import { IConnection } from '../containers/InterfaceCreator/connection';
import { IFSMMetadata, IFSMStates } from '../containers/InterfaceCreator/fsm';
import { IField } from '../containers/InterfaceCreator/panel';
import { IPipelineElement, IPipelineMetadata } from '../containers/InterfaceCreator/pipeline';

export interface IDraftData {
  interfaceKind: string;
  interfaceId: string;
  fields?: any[];
  selectedFields?: any[];
  methods?: any;
  selectedMethods?: any;
  steps?: {
    steps: any[];
    stepsData: any[];
    lastStepId?: number;
  };
  diagram?: any;
  typeData?: any;
  pipelineData?: {
    metadata: IPipelineMetadata;
    elements: IPipelineElement[];
  };
  fsmData?: {
    metadata: IFSMMetadata;
    states: IFSMStates;
  };
  isValid?: boolean;
  connectionData?: {
    data: IConnection;
    fields: IField[];
  };
  classConnections?: IClassConnections;
  associatedInterface?: string;
}

export interface IDraftsContext {
  draft?: any;
  addDraft?: (draft: any) => void;
  removeDraft?: () => void;
  maybeApplyDraft?: (
    interfaceKind: string,
    draftData?: IDraftData,
    existingInterface?: { [key: string]: any },
    customFunction?: (draft: IDraftData) => void,
    classConnectionsFunction?: (classConnections: IClassConnections) => unknown
  ) => void;
  maybeDeleteDraft?: (
    interfaceKind: string,
    interfaceId?: string,
    customFunction?: (draft: IDraftData) => void
  ) => void;
}

export const DraftsContext = createContext<IDraftsContext>({});
