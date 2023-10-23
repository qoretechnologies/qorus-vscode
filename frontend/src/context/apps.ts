import { createContext } from 'react';
import { IApp } from '../components/AppCatalogue';

export type TAppsContext = IApp[];

export const AppsContext = createContext<TAppsContext>([]);
