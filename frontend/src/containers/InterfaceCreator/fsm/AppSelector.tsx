import { ReqoreColumn, ReqoreColumns, ReqoreSpinner } from '@qoretechnologies/reqore';
import { map } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useAsyncRetry } from 'react-use';
import { TFSMVariables } from '.';
import {
  AppCatalogue,
  IApp,
  IAppAction,
  IAppCatalogueProps,
} from '../../../components/AppCatalogue';
import { useQorusStorage } from '../../../hooks/useQorusStorage';
import { TAction } from './stateDialog';

export interface IAppSelectorProps {
  onActionSelect: IAppCatalogueProps['onActionSelect'];
  fetchData: any;
  includeEventActions?: boolean;
  variables?: TFSMVariables;
  showVariables?: (data: {
    show?: boolean;
    selected?: {
      name: string;
      variableType: 'globalvar' | 'localvar' | 'autovar';
    };
  }) => void;
}

export const filterApps = (
  apps: IApp[],
  filter: string,
  filterValue: any,
  includeEventActions: boolean
) => {
  return apps?.filter((app) => {
    if (app[filter] === filterValue) {
      if (includeEventActions) {
        return true;
      }

      // Check if this app has other actions than event actions
      return app.actions?.some((action) => action.action_code_str !== 'EVENT');
    }

    return false;
  });
};

export const AppSelector = ({
  onActionSelect,
  fetchData,
  includeEventActions,
  variables = {},
  showVariables,
}: IAppSelectorProps) => {
  const { value, loading } = useAsyncRetry<IApp[]>(async () => {
    const apps = await fetchData('dataprovider/apps');

    return apps.data;
  }, []);
  const favorites = useQorusStorage<string[]>('vscode.appCatalogueFavorites', []);

  const apps = useMemo(() => {
    if (!value) return [];
    return filterApps(value, 'builtin', false, includeEventActions);
  }, [value]);

  const builtInApps = useMemo(() => {
    if (!value) return [];
    let apps = filterApps(value, 'builtin', true, includeEventActions);

    // Need to add variables to built in apps
    apps = [
      {
        display_name: 'Variables',
        short_desc: 'Variables',
        name: 'variables',
        builtin: true,
        collectionActions() {
          return [
            {
              label: 'Manage',
              icon: 'Settings5Line',
              tooltip: 'Manage variables',
              onClick: () => showVariables({ show: true }),
            },
          ];
        },
        logo: 'https://hq.qoretechnologies.com:8092/api/public/apps/QorusDataObjects/qorus-builtin-data.svg',
        actions: map(
          variables,
          (variable, id): IAppAction => ({
            display_name: id,
            action_code_str: 'VARIABLE',
            action: 'var-action',
            app: 'variables',
            short_desc: variable.desc || 'Action from a variable',
            action_code: 2,
            desc: variable.desc || 'Action from a variable',
            logo: 'https://hq.qoretechnologies.com:8092/api/public/apps/QorusDataObjects/qorus-builtin-data.svg',
            varName: variable.name,
            varType: variable.variableType,
            varReadOnly: variable.readOnly,
            actions: (action) => [
              {
                icon: action.varReadOnly ? 'EyeLine' : 'EditLine',
                tooltip: action.varReadOnly ? 'View variable' : 'Edit variable',
                className: 'manage-variable',
                onClick: () => {
                  showVariables({
                    show: true,
                    selected: { name: action.varName, variableType: action.varType },
                  });
                },
              },
            ],
          })
        ),
      },
      ...apps,
    ];

    return apps;
  }, [value, variables]);

  const handleFavoriteClick = useCallback(
    (app) => {
      if (favorites.value.includes(app)) {
        favorites.update(
          favorites.value.filter((fav) => fav !== app),
          process.env.NODE_ENV !== 'production'
        );
      } else {
        favorites.update([...favorites.value, app], process.env.NODE_ENV !== 'production');
      }
    },
    [favorites]
  );

  if (loading) {
    return <ReqoreSpinner centered>Loading apps...</ReqoreSpinner>;
  }

  return (
    <ReqoreColumns columnsGap="30px">
      <ReqoreColumn style={{ gridColumn: '1 / span 2' }}>
        <AppCatalogue
          apps={apps}
          icon="Apps2Line"
          onActionSelect={(action, app) => onActionSelect({ ...action, type: 'action' }, app)}
          label="Applications"
          favorites={favorites.value}
          onFavoriteClick={handleFavoriteClick}
        />
      </ReqoreColumn>
      <ReqoreColumn>
        <AppCatalogue
          icon="AppsLine"
          sortable={false}
          image="https://hq.qoretechnologies.com:8092/api/public/apps/QorusApiObjects/qorus-builtin-api.svg"
          apps={builtInApps}
          onActionSelect={(action, app) =>
            onActionSelect({ ...action, type: action.action as TAction }, app)
          }
          label="Built in modules"
          onFavoriteClick={handleFavoriteClick}
          favorites={favorites.value}
        />
      </ReqoreColumn>
    </ReqoreColumns>
  );
};
