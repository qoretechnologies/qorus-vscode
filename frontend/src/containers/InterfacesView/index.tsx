import {
  ReqoreCollection,
  ReqorePanel,
  ReqoreTabs,
  ReqoreTabsContent,
  useReqoreProperty,
} from '@qoretechnologies/reqore';
import { TReqoreBadge } from '@qoretechnologies/reqore/dist/components/Button';
import { capitalize, map, size } from 'lodash';
import { useContext, useState } from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { useMount } from 'react-use';
import { NegativeColorEffect, SelectorColorEffect } from '../../components/Field/multiPair';
import { IField } from '../../components/FieldWrapper';
import Loader from '../../components/Loader';
import {
  interfaceIcons,
  interfaceKindTransform,
  interfaceToPlural,
} from '../../constants/interfaces';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { callBackendBasic, deleteDraft } from '../../helpers/functions';
import { addMessageListener, postMessage } from '../../hocomponents/withMessageHandler';
import { IClassConnections } from '../ClassConnectionsManager';
import { IConnection } from '../InterfaceCreator/connection';
import { IFSMMetadata, IFSMStates } from '../InterfaceCreator/fsm';
import { IPipelineElement, IPipelineMetadata } from '../InterfaceCreator/pipeline';

export interface IQorusInterface extends IDraftData {
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
  const confirmAction = useReqoreProperty('confirmAction');
  const addNotification = useReqoreProperty('addNotification');
  const { changeDraft } = useContext(InitialContext);

  console.log(items);

  useMount(() => {
    addMessageListener('get-all-interfaces-complete', (data) => {
      setItems(data.data);
    });

    (async () => {
      const data = await callBackendBasic(Messages.GET_ALL_INTERFACES);

      setItems(data.data);
    })();
  });

  if (!items) {
    return <Loader text="Loading interfaces" />;
  }

  const onDeleteClick = async (interfaceKind, interfaceId) => {
    await deleteDraft(interfaceKindTransform[interfaceKind], interfaceId, false, addNotification);
  };

  const isValid = (draftData: IDraftData) => {
    return draftData.isValid;
  };

  const buildBadges = (data: IQorusInterface): TReqoreBadge[] => {
    let badges: TReqoreBadge[] = [];

    if (data.isDraft) {
      badges = [
        {
          label: 'New Draft',
          minimal: false,
          intent: 'success',
        },
        {
          labelKey: 'Fields',
          label: size(data.selectedFields),
        },
      ];

      if (size(data.selectedMethods) > 0) {
        badges.push({
          labelKey: 'Methods',
          label: size(data.selectedMethods),
        });
      }

      if (size(data.steps) > 0) {
        badges.push({
          labelKey: 'Steps',
          label: size(data.steps.steps),
        });
      }
    }

    if (data.hasDraft) {
      badges.push({
        label: 'Draft',
        minimal: false,
        intent: 'pending',
      });
    }

    if (data.isDraft || data.hasDraft) {
      badges.push({
        labelKey: 'Status',
        label: isValid(data) ? 'Valid' : 'Invalid',
        intent: isValid(data) ? 'success' : 'danger',
        minimal: false,
      });
    }

    return badges;
  };

  return (
    <ReqorePanel
      minimal
      flat
      transparent
      fill
      label="Interfaces view"
      contentStyle={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ReqoreTabs
        padded={false}
        activeTabIntent="info"
        fillParent
        vertical
        tabsPadding="horizontal"
        tabs={map(items, (data, iface) => ({
          id: iface,
          label: capitalize(interfaceToPlural[iface]).replace('-', ' '),
          badge: size(data),
          icon: interfaceIcons[iface],
        }))}
      >
        {map(items, (data, iface) => (
          <ReqoreTabsContent tabId={iface} key={iface}>
            <ReqoreCollection
              label={capitalize(interfaceToPlural[iface]).replace('-', ' ')}
              sortable
              filterable
              flat={false}
              opacity={1}
              minimal
              icon={interfaceIcons[iface]}
              paging="buttons"
              items={data.map(({ name, data, isDraft, hasDraft, ...rest }) => ({
                label: name,
                icon: isDraft || hasDraft ? 'EditLine' : undefined,
                iconColor: isDraft || hasDraft ? 'pending' : undefined,
                badge: buildBadges({ name, data, isDraft, hasDraft, ...rest }),
                content: data?.desc ? <ReactMarkdown>{data.desc}</ReactMarkdown> : 'No description',
                responsiveTitle: false,
                responsiveActions: false,
                size: 'small',
                onClick: () => {
                  if (isDraft) {
                    changeDraft({
                      interfaceKind: iface,
                      interfaceId: rest.interfaceId,
                    });
                  } else {
                    postMessage(Messages.GET_INTERFACE_DATA, {
                      iface_kind: iface,
                      name,
                      include_tabs: true,
                    });
                  }
                },
                actions: [
                  {
                    icon: 'FileEditLine',
                    effect: SelectorColorEffect,
                    tooltip: 'Edit code',
                    show: !!data?.code,
                  },
                  {
                    icon: 'DeleteBinLine',
                    effect: NegativeColorEffect,
                    tooltip: 'Delete',
                    onClick: () => {
                      if (isDraft) {
                        confirmAction({
                          title: 'Delete draft',
                          description: 'Are you sure you want to delete this draft?',
                          onConfirm: () => {
                            onDeleteClick(iface, rest.interfaceId);
                          },
                        });
                      } else {
                        confirmAction({
                          title: 'Delete interface',
                          description: 'Are you sure you want to delete this interface?',
                          onConfirm: () => {
                            postMessage(Messages.DELETE_INTERFACE, { iface_kind: iface, name });
                          },
                        });
                      }
                    },
                  },
                ],
              }))}
            />
          </ReqoreTabsContent>
        ))}
      </ReqoreTabs>
    </ReqorePanel>
  );
};
