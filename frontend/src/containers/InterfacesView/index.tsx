import {
  ReqoreHorizontalSpacer,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqorePanel,
} from '@qoretechnologies/reqore';
import { map } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import { useMount } from 'react-use';
import { PositiveColorEffect } from '../../components/Field/multiPair';
import { IField } from '../../components/FieldWrapper';
import Loader from '../../components/Loader';
import { interfaceIcons, interfaceKindToName } from '../../constants/interfaces';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { callBackendBasic } from '../../helpers/functions';
import { IClassConnections } from '../ClassConnectionsManager';
import { IConnection } from '../InterfaceCreator/connection';
import { IFSMMetadata, IFSMStates } from '../InterfaceCreator/fsm';
import { IPipelineElement, IPipelineMetadata } from '../InterfaceCreator/pipeline';
import { InterfacesViewCollection } from './collection';

export interface IQorusInterface extends Partial<IDraftData> {
  name?: string;
  display_name?: string;
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

export type TQorusInterfaceCount = Record<string, { items: number; drafts: number }>;

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
  const [items, setItems] = useState<TQorusInterfaceCount>(null);
  const [type, setType] = useState(subtab || 'class');
  const [zoom, setZoom] = useState(0.5);

  useEffect(() => {
    setType(subtab || 'class');
  }, [subtab]);

  useMount(() => {
    (async () => {
      const data = await callBackendBasic(
        Messages.GET_ALL_INTERFACES_COUNT,
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );

      setItems(data.data);
    })();
  });

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
        {map(items, (data, iface) => (
          <ReqoreMenuItem
            key={iface}
            icon={interfaceIcons[iface]}
            flat={type !== iface}
            effect={type === iface ? PositiveColorEffect : undefined}
            onClick={() => {
              changeTab?.('Interfaces', iface);
              setType(iface);
            }}
            badge={[data.items, data.drafts]}
          >
            {interfaceKindToName[iface]}
          </ReqoreMenuItem>
        ))}
      </ReqoreMenu>
      <ReqoreHorizontalSpacer width={10} />
      <InterfacesViewCollection type={type} zoom={zoom} />
    </ReqorePanel>
  );
};
