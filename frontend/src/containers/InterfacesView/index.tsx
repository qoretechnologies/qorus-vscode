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
import { SynthColorEffect } from '../../components/Field/multiPair';
import { IField } from '../../components/FieldWrapper';
import Loader from '../../components/Loader';
import { interfaceIcons, interfaceKindToName } from '../../constants/interfaces';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { callBackendBasic } from '../../helpers/functions';
import { addMessageListener } from '../../hocomponents/withMessageHandler';
import { IClassConnections } from '../ClassConnectionsManager';
import { IConnection } from '../InterfaceCreator/connection';
import { IFSMMetadata, IFSMStates } from '../InterfaceCreator/fsm';
import { IPipelineElement, IPipelineMetadata } from '../InterfaceCreator/pipeline';
import { InterfacesViewCollection } from './collection';

export interface IQorusInterface extends Partial<IDraftData> {
  name?: string;
  data?: {
    name: string;
    display_name?: string;
    short_desc?: string;
    type: string;
    desc?: string;
    target_dir: string;
    yaml_file: string;
    target_file?: string;
    [key: string]: any;
  };
  isDraft?: boolean;
  isServerInterface?: boolean;
  isLocalInterface?: boolean;
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
  const { qorus_instance, subtab, changeTab, is_hosted_instance } = useContext(InitialContext);
  const [items, setItems] = useState<Record<string, IQorusInterface[]>>(null);
  const [type, setType] = useState(subtab || 'class');
  const [showRemotes, setShowRemotes] = useState(is_hosted_instance || !!qorus_instance);
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
      fill
      responsiveTitle
      responsiveActions={false}
      contentStyle={{
        display: 'flex',
        flexFlow: 'row',
        overflow: 'hidden',
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      <ReqoreMenu transparent width="250px">
        <ReqoreMenuDivider label="Interfaces" align="left" />
        {map(interfaces, (data, iface) => (
          <ReqoreMenuItem
            key={iface}
            icon={interfaceIcons[iface]}
            flat={type !== iface}
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
            key={iface}
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
