import {
  ReqoreHorizontalSpacer,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
  ReqorePanel,
  useReqoreProperty,
} from '@qoretechnologies/reqore';
import { cloneDeep, map, size } from 'lodash';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useMount } from 'react-use';
import {
  QorusColorEffect,
  SynthColorEffect,
  WarningColorEffect,
} from '../../components/Field/multiPair';
import { IField } from '../../components/FieldWrapper';
import Loader from '../../components/Loader';
import { interfaceIcons, interfaceKindToName, interfaceToPlural } from '../../constants/interfaces';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { callBackendBasic } from '../../helpers/functions';
import { addMessageListener, postMessage } from '../../hocomponents/withMessageHandler';
import { IClassConnections } from '../ClassConnectionsManager';
import { getZoomActions } from '../ConfigItemManager';
import { IConnection } from '../InterfaceCreator/connection';
import { IFSMMetadata, IFSMStates } from '../InterfaceCreator/fsm';
import { IPipelineElement, IPipelineMetadata } from '../InterfaceCreator/pipeline';
import { InterfacesViewCollection } from './collection';

export interface IQorusInterface extends Partial<IDraftData> {
  name: string;
  data?: {
    name: string;
    type: string;
    desc?: string;
    target_dir: string;
    yaml_file: string;
    target_file?: string;
    [key: string]: any;
  };
  isDraft?: boolean;
  isServerInterface?: boolean;
  hasDraft?: boolean;
  date?: string;
}

export interface IDraftData {
  interfaceKind: string;
  interfaceId: string;
  fields?: any[];
  selectedFields?: any[];
  methods?: any;
  selectedMethods?: any;
  steps?: {
    steps: any[];
    stepsData: any[];
    lastStepId?: number;
  };
  diagram?: any;
  typeData?: any;
  pipelineData?: {
    metadata: IPipelineMetadata;
    elements: IPipelineElement[];
  };
  fsmData?: {
    metadata: IFSMMetadata;
    states: IFSMStates;
  };
  isValid?: boolean;
  connectionData?: {
    data: IConnection;
    fields: IField[];
  };
  classConnections?: IClassConnections;
  associatedInterface?: string;
}

export interface IQorusInterfacesViewProps {}

export const InterfacesView = () => {
  const { qorus_instance, subtab, changeTab } = useContext(InitialContext);
  const [items, setItems] = useState<Record<string, IQorusInterface[]>>(null);
  const [type, setType] = useState(subtab || 'class');
  const [showRemotes, setShowRemotes] = useState(false);
  const addNotification = useReqoreProperty('addNotification');
  const [zoom, setZoom] = useState(0.5);

  useEffect(() => {
    setType(subtab || 'class');
  }, [subtab]);

  useMount(() => {
    addMessageListener('get-all-interfaces-complete', (data) => {
      if (data?.data) {
        // Add sync events instead of events
        const newData = { ...data.data };
        newData['sync-event'] = newData.event;
        delete newData.event;

        setItems(newData);
      }
    });

    (async () => {
      const data = await callBackendBasic(Messages.GET_ALL_INTERFACES);
      // Add sync events instead of events
      const newData = { ...data.data };
      newData['sync-event'] = newData.event;
      delete newData.event;

      setItems(newData);
    })();
  });

  const getDraftsCount = (data: IQorusInterface[]) => {
    return size(data.filter((item) => item.isDraft || item.hasDraft));
  };

  const { interfaces, otherItems } = useMemo(() => {
    const newItems = cloneDeep(items);
    const otherItems = {
      'schema-modules': items?.['schema-modules'],
      scripts: items?.scripts,
      tests: items?.tests,
    };

    delete newItems?.['schema-modules'];
    delete newItems?.scripts;
    delete newItems?.tests;

    return { interfaces: newItems, otherItems };
  }, [items]);

  const isCurrentTypeOther = useMemo(() => !!otherItems[type], [type, otherItems]);

  if (!items) {
    return <Loader text="Loading interfaces" />;
  }

  return (
    <ReqorePanel
      minimal
      flat
      transparent
      fill
      icon="FileList2Line"
      label="Interfaces"
      responsiveTitle
      responsiveActions={false}
      size="big"
      actions={[
        {
          fluid: false,
          group: getZoomActions('interfaces', zoom, setZoom),
        },
        {
          icon: showRemotes ? 'ServerFill' : 'ServerLine',
          label: `${showRemotes ? 'Hide' : 'Show'} remote ${interfaceToPlural[type]}`,
          minimal: !showRemotes,
          flat: false,
          disabled: !qorus_instance,
          onClick: () => setShowRemotes(!showRemotes),
          effect: QorusColorEffect,
          show: !isCurrentTypeOther,
          className: 'interfaces-toggle-remotes',
        },
        {
          tooltip: 'Delete all drafts',
          icon: 'DeleteBin6Fill',
          effect: WarningColorEffect,
          flat: false,
          minimal: true,
          show: !isCurrentTypeOther,
          onClick: () => {
            postMessage(Messages.DELETE_ALL_DRAFTS);
            addNotification({
              intent: 'success',
              title: 'All drafts deleted',
              content: 'All drafts were deleted successfully',
              duration: 2000,
            });
          },
        },
      ]}
      contentStyle={{
        display: 'flex',
        flexFlow: 'row',
        overflow: 'hidden',
      }}
    >
      <ReqoreMenu transparent width="250px">
        <ReqoreMenuDivider label="Interfaces" align="left" />
        {map(interfaces, (data, iface) => (
          <ReqoreMenuItem
            icon={interfaceIcons[iface]}
            flat={type !== iface}
            wrap
            effect={
              type === iface
                ? {
                    gradient: {
                      ...SynthColorEffect.gradient,
                      animate: 'hover',
                    },
                  }
                : undefined
            }
            onClick={() => {
              changeTab?.('Interfaces', iface);
              setType(iface);
            }}
            badge={[{ labelKey: 'Drafts', label: getDraftsCount(data), intent: 'pending' }]}
          >
            {interfaceKindToName[iface]}
          </ReqoreMenuItem>
        ))}
        <ReqoreMenuDivider label="Other files" align="left" />
        {map(otherItems, (data, iface) => (
          <ReqoreMenuItem
            icon={interfaceIcons[iface]}
            flat={type !== iface}
            wrap
            effect={
              type === iface
                ? {
                    gradient: {
                      ...SynthColorEffect.gradient,
                      animate: 'hover',
                    },
                  }
                : undefined
            }
            onClick={() => {
              changeTab?.('Interfaces', iface);
              setType(iface);
            }}
          >
            {interfaceKindToName[iface]}
          </ReqoreMenuItem>
        ))}
      </ReqoreMenu>
      <ReqoreHorizontalSpacer width={10} />
      <InterfacesViewCollection
        items={items[type]}
        type={type}
        showRemotes={showRemotes}
        zoom={zoom}
        isOther={!!otherItems[type]}
      />
    </ReqorePanel>
  );
};
