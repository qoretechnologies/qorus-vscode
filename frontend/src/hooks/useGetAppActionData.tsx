import { useContext } from 'react';
import { IApp, IAppAction } from '../components/AppCatalogue';
import { AppsContext } from '../context/apps';

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
    return appsContext;
  }

  if (!action) {
    return appsContext.find((a) => a.name === app);
  }

  const appData = appsContext.find((a) => a.name === app);
  const actionData = appData.actions.find((a) => a.action === action);

  return { app: appData, action: actionData };
}
