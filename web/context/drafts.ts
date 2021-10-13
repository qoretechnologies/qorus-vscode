import { createContext } from 'react';

export interface IDraftData {
    interfaceKind: string;
    interfaceId: string;
    fields: any[];
    methods?: any;
}

export interface IDraftsContext {
    draft?: any;
    addDraft?: (draft: any) => void;
    removeDraft?: () => void;
    maybeApplyDraft?: (interfaceKind: string, draftData?: IDraftData) => void;
}

export const DraftsContext = createContext<IDraftsContext>({});
