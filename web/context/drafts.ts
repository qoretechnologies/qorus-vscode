import { createContext } from 'react';

export interface IDraftData {
  interfaceKind: string;
  interfaceId: string;
  fields: any[];
  selectedFields?: any[];
  methods?: any;
  selectedMethods?: any;
  steps?: {
    steps: any[];
    stepsData: any[];
  };
  diagram?: any;
  typeData?: any;
}

export interface IDraftsContext {
  draft?: any;
  addDraft?: (draft: any) => void;
  removeDraft?: () => void;
  maybeApplyDraft?: (
    interfaceKind: string,
    draftData?: IDraftData,
    customFunction?: (draft: IDraftData) => void
  ) => void;
  maybeDeleteDraft?: (
    interfaceKind: string,
    interfaceId?: string,
    customFunction?: (draft: IDraftData) => void
  ) => void;
}

export const DraftsContext = createContext<IDraftsContext>({});
