import { createContext } from 'react';

export interface IMethodsContext {
  showMethods?: boolean;
  setShowMethods?: any;
  methods?: any;
  handleAddMethodClick?: any;
  methodsCount?: number;
  activeMethod?: number;
  setActiveMethod?: (id: number) => void;
  setMethods?: any;
  setMethodsCount?: any;
  methodsData?: any;
  resetMethods?: () => void;
  lastMethodId?: number;
  setLastMethodId?: (id: number) => void;
  initialActiveMethod?: number;
  initialShowMethods?: boolean;
  setMethodsFromDraft?: any;
  addNewMethodWithData?: any;
}

export const MethodsContext = createContext<IMethodsContext>({});
