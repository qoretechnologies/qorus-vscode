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
          icon: 'Home3Fill',
          id: 'ProjectConfig',
          props: {
            onClick: () => initialData?.changeTab('ProjectConfig'),
          },
        },
        {
          name: 'Source Directories',
          icon: 'FolderAddLine',
          id: 'SourceDirs',
          props: {
            onClick: () => initialData?.changeTab('SourceDirs'),
          },
        },
        {
          name: 'Release Management',
          icon: 'CodeBoxLine',
          id: 'ReleasePackage',
          props: {
            onClick: () => initialData?.changeTab('ReleasePackage'),
          },
        },
        {
          name: 'Interface Management',
          icon: 'FileCopyLine',
          id: 'DeleteInterfaces',
          props: {
            onClick: () => initialData?.changeTab('DeleteInterfaces'),
          },
        },
        {
          name: 'Interface List',
          icon: 'FileList2Line',
          id: 'Interfaces',
          props: {
            onClick: () => initialData?.changeTab('Interfaces'),
          },
        },
      ],
    },
    interfaces: {
      title: 'Interface Management',
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
