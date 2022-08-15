import { createContext } from 'react';

export interface IDialogsContext {
    addDialog?: (id: string, onClose: () => any) => void;
    removeDialog?: (id: string) => void;
}

export const DialogsContext = createContext<IDialogsContext>({});
