import { IApp, IAppAction } from '../components/AppCatalogue';
import { IActionSet } from '../containers/InterfaceCreator/fsm/ActionSetDialog';
import { useQorusStorage } from './useQorusStorage';

export interface IActionSetsHook {
  app: IApp;
  value: IActionSet[];
  addNewActionSet: (actionSet: IActionSet) => void;
  loading: boolean;
  error: any;
  retry: () => void;
}

export const buildAppFromActionSets = (actionSets: IActionSet[]): IApp => {
  return {
    display_name: 'Action sets',
    name: 'action_sets',
    icon: 'CollageLine',
    short_desc: 'Action sets',
    builtin: false,
    is_action_set: true,
    actions: actionSets.map(
      ({ options, states }): IAppAction => ({
        display_name: options.name.value,
        action: options.name.value,
        short_desc: options.shortDescription?.value,
        icon: 'CollageLine',
        action_code_str: 'API',
        app: 'action_sets',
        metadata: {
          states,
        },
      })
    ),
  };
};

export const useActionSets = (): IActionSetsHook => {
  const storage = useQorusStorage<IActionSet[]>('vscode.customActionSets', []);

  const addNewActionSet = (actionSet: IActionSet) => {
    storage.update([...storage.value, actionSet]);
  };

  return {
    app: buildAppFromActionSets(storage.value),
    value: storage.value,
    addNewActionSet,
    loading: storage.loading,
    error: storage.error,
    retry: () => {
      storage.refetch();
    },
  };
};
