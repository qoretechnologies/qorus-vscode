import { useContext } from 'react';
import { IApp, IAppAction } from '../components/AppCatalogue';
import { AppsContext } from '../context/apps';
import { getAppAndAction } from '../helpers/fsm';

export function useGetAppActionData(): IApp[];
export function useGetAppActionData(app: string): IApp;
export function useGetAppActionData(app: string, action: string): { app: IApp; action: IAppAction };
export function useGetAppActionData(
  app?: string,
  action?: string
): IApp | IApp[] | { app: IApp; action: IAppAction } {
  // Get all the apps
  const appsContext = useContext(AppsContext);

  if (!app) {
    return appsContext.apps;
  }

  if (!action) {
    return getAppAndAction(appsContext.apps, app)?.app;
  }

  return getAppAndAction(appsContext.apps, app, action);
}
