import {
  ReqoreHorizontalSpacer,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqorePanel,
  useReqoreProperty,
} from '@qoretechnologies/reqore';
import { capitalize, map, size } from 'lodash';
import { useContext, useState } from 'react';
import { useMount } from 'react-use';
import {
  QorusColorEffect,
  SynthColorEffect,
  WarningColorEffect,
} from '../../components/Field/multiPair';
import { IField } from '../../components/FieldWrapper';
import Loader from '../../components/Loader';
import { interfaceIcons, interfaceToPlural } from '../../constants/interfaces';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { callBackendBasic } from '../../helpers/functions';
import { addMessageListener, postMessage } from '../../hocomponents/withMessageHandler';
import { IClassConnections } from '../ClassConnectionsManager';
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
  const [items, setItems] = useState<Record<string, IQorusInterface[]>>(null);
  const [type, setType] = useState('class');
  const [showRemotes, setShowRemotes] = useState(false);
  const addNotification = useReqoreProperty('addNotification');
  const { qorus_instance } = useContext(InitialContext);

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

  if (!items) {
    return <Loader text="Loading interfaces" />;
  }

  const getItemsCount = (data: IQorusInterface[]) => {
    return size(data.filter((item) => !item.isDraft));
  };

  const getDraftsCount = (data: IQorusInterface[]) => {
    return size(data.filter((item) => item.isDraft || item.hasDraft));
  };

  return (
    <ReqorePanel
      minimal
      flat
      transparent
      fill
      label="Interfaces view"
      actions={[
        {
          icon: showRemotes ? 'ServerFill' : 'ServerLine',
          label: `${showRemotes ? 'Hide' : 'Show'} remote ${interfaceToPlural[type]}`,
          minimal: !showRemotes,
          flat: false,
          disabled: !qorus_instance,
          onClick: () => setShowRemotes(!showRemotes),
          effect: QorusColorEffect,
        },
        {
          tooltip: 'Delete all drafts',
          icon: 'DeleteBin6Fill',
          effect: WarningColorEffect,
          flat: false,
          minimal: true,
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
        {map(items, (data, iface) => (
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
            onClick={() => setType(iface)}
            badge={[{ labelKey: 'Drafts', label: getDraftsCount(data), intent: 'pending' }]}
          >
            {capitalize(interfaceToPlural[iface]).replace('-', ' ')}
          </ReqoreMenuItem>
        ))}
      </ReqoreMenu>
      <ReqoreHorizontalSpacer width={10} />
      <InterfacesViewCollection items={items[type]} type={type} showRemotes={showRemotes} />
    </ReqorePanel>
  );
};
