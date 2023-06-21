import {
  IQorusSidebarItem,
  IQorusSidebarItems,
} from '@qoretechnologies/reqore/dist/components/Sidebar';
import { interfaceNameToKind } from './interfaces';

export const MenuSubItems: Omit<IQorusSidebarItem, 'id'>[] = [
  {
    name: 'Class',
    icon: 'CodeSLine',
  },
  {
    name: 'Workflow',
    icon: 'GitBranchLine',
  },
  {
    name: 'Service',
    icon: 'ServerLine',
  },
  {
    name: 'Job',
    icon: 'CalendarLine',
  },
  {
    name: 'Flow Builder',
    icon: 'DashboardLine',
  },
  {
    name: 'Mapper',
    icon: 'MindMap',
  },
  {
    name: 'Mapper Code',
    icon: 'FunctionLine',
  },
  {
    name: 'Type',
    icon: 'Asterisk',
  },
  {
    name: 'Pipeline',
    icon: 'NodeTree',
  },
  {
    name: 'Step',
    icon: 'StickyNoteLine',
  },
  {
    name: 'Connection',
    icon: 'Plug2Line',
  },
  {
    name: 'Group',
    icon: 'GridFill',
  },
  {
    name: 'Sync Event',
    icon: 'GitCommitLine',
  },
  {
    name: 'Queue',
    icon: 'StackLine',
  },
  {
    name: 'Value Map',
    icon: 'BringToFront',
  },
  {
    name: 'Errors',
    icon: 'ErrorWarningLine',
  },
];

export const buildMenu = (initialData?: any): IQorusSidebarItems => {
  return {
    menu: {
      items: [
        {
          name: 'Environments',
          activePaths: ['ProjectConfig'],
          icon: 'Home3Fill',
          id: 'ProjectConfig',
          props: {
            onClick: () => initialData?.changeTab('ProjectConfig'),
          },
        },
        {
          name: 'Interfaces, drafts & files',
          activePaths: ['Interfaces'],
          icon: 'FileList2Line',
          id: 'Interfaces',
          props: {
            onClick: () => initialData?.changeTab('Interfaces'),
          },
        },
        {
          name: 'Source Directories',
          activePaths: ['SourceDirs'],
          icon: 'FolderAddLine',
          id: 'SourceDirs',
          props: {
            onClick: () => initialData?.changeTab('SourceDirs'),
          },
        },
        {
          name: 'Release Management',
          activePaths: ['ReleasePackage'],
          icon: 'CodeBoxLine',
          id: 'ReleasePackage',
          props: {
            onClick: () => initialData?.changeTab('ReleasePackage'),
          },
        },
      ],
    },
    interfaces: {
      title: 'Quickly create new',
      items: MenuSubItems.map((item) => ({
        ...item,
        props: {
          onClick: () =>
            initialData?.changeTab(
              'CreateInterface',
              interfaceNameToKind[item.name === 'Sync Event' ? 'Event' : item.name]
            ),
        },
        id: item.name!.toLowerCase(),
      })),
    },
  };
};
