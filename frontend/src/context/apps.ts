import { createContext } from 'react';
import { IApp } from '../components/AppCatalogue';
import { IActionSet } from '../containers/InterfaceCreator/fsm/ActionSetDialog';

export type TAppsContext = {
  apps?: IApp[];
  actionSets?: IActionSet[];
  addNewActionSet?: (actionSet: IActionSet) => void;
  loading?: boolean;
  error?: any;
  retry?: () => void;
};

export const AppsContext = createContext<TAppsContext>({
  apps: [],
  actionSets: [],
});
