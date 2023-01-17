import {
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { IReqoreControlGroupProps } from '@qoretechnologies/reqore/dist/components/ControlGroup';
import ReqoreIcon, { IReqoreIconProps } from '@qoretechnologies/reqore/dist/components/Icon';
import { IReqorePanelAction } from '@qoretechnologies/reqore/dist/components/Panel';
import { IReqoreTooltip } from '@qoretechnologies/reqore/dist/types/global';
import size from 'lodash/size';
import { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';

export interface IFieldWrapper {
  label?: string;
  isValid?: boolean;
  info?: string;
  type?: string;
  desc?: string;
  name?: string;
  onClick?: (name: string) => any;
  removable?: boolean;
  value?: any;
  parentValue?: any;
  onResetClick?: () => any;
  isSet?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  collapsible?: boolean;
}

export const getGlobalDescriptionTooltip = (desc?: string, title?: string): IReqoreTooltip => ({
  content: <ReactMarkdown>{desc}</ReactMarkdown>,
  intent: 'info',
  placement: 'right',
  maxWidth: '600px',
  title,
});

export const getFieldDescriptionAction = (desc?: string, title?: string): IReqorePanelAction => ({
  as: ReqoreIcon,
  props: {
    icon: 'QuestionMark',
    tooltip: getGlobalDescriptionTooltip(desc, title),
  } as IReqoreIconProps,
  show: !!desc,
});

export const FieldWrapper = ({
  children,
  label,
  isValid,
  info,
  type,
  desc,
  name,
  onClick,
  removable,
  value,
  collapsible = true,
  parentValue,
  onResetClick,
  isSet,
  disabled,
}: IFieldWrapper) => {
  const initContext = useContext(InitialContext);
  const t = useContext(TextContext);

  return (
    <ReqorePanel
      label={label}
      flat
      collapsible={collapsible}
      rounded={false}
      icon={label || collapsible ? (isValid ? 'CheckLine' : 'ErrorWarningLine') : undefined}
      intent={isValid ? undefined : 'danger'}
      iconColor={isValid ? undefined : 'danger:lighten'}
      badge={type}
      unMountContentOnCollapse={false}
      actions={[
        getFieldDescriptionAction(desc),
        {
          icon: 'DeleteBinLine',
          show: !!removable,
          intent: 'danger',
          tooltip: t('RemoveField'),
          onClick: () => {
            if (onClick) {
              if (size(value)) {
                initContext.confirmAction('ConfirmRemoveField', () => onClick(name));
              } else {
                onClick(name);
              }
            }
          },
        },
      ]}
    >
      {info && (
        <>
          <ReqoreMessage intent="info" size="small">
            {info}
          </ReqoreMessage>
          <ReqoreVerticalSpacer height={10} />
        </>
      )}
      {children}
    </ReqorePanel>
  );
};

export const FieldInputWrapper = styled.div`
  flex: 1 auto;
`;

export const SearchWrapper = styled.div`
  flex: 0;
  margin-bottom: 10px;
`;
export const ContentWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-flow: column;
  gap: 25px;

  > * {
    flex-shrink: 0 !important;
  }
`;

export const ActionsWrapper = ({ children, ...rest }: IReqoreControlGroupProps) => (
  <ReqoreControlGroup {...rest}>{children}</ReqoreControlGroup>
);

export interface IInterfaceCreatorPanel {
  type: string;
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  onSubmit: (fields: any) => void;
  onFinalSubmit: (data: any) => any;
  t: TTranslator;
  methodsList: { id: number; name: string }[];
  forceSubmit?: boolean;
  resetFields: (type: string) => void;
  openFileOnSubmit: boolean;
  hasConfigManager?: boolean;
  parent?: string;
  fileName?: string;
  fields: IField[];
  selectedFields: IField[];
  setFields: (type: string, fields: IField[] | Function, activeId?: number) => void;
  setSelectedFields: (type: string, fields: IField[] | Function, activeId?: number) => void;
  query?: string;
  setQuery: (type: string, value?: string) => void;
  selectedQuery?: string;
  setSelectedQuery: (type: string, value?: string) => void;
  activeId?: number;
  onNameChange?: (activeId: number, newName: string, originalName?: string) => any;
  isFormValid: (type: string, interfaceIndex?: number) => boolean;
  stepOneTitle?: string;
  stepTwoTitle?: string;
  submitLabel?: string;
  onBackClick?: () => void;
  allSelectedFields: {
    [type: string]: {
      [interfaceIndex: number]: IField[];
    };
  };
  data?: any;
  onDataFinishLoading?: () => any;
  onDataFinishLoadingRecur?: (activeId: number) => any;
  isEditing?: boolean;
  allMethodsData?: any[];
  initialData?: any;
  interfaceId?: string;
  initialInterfaceId?: string;
  setInterfaceId: (interfaceType: string, id: string) => void;
  disabledFields?: string[];
  hasClassConnections?: boolean;
  definitionsOnly?: boolean;
  context?: {
    iface_kind: string;
    name: string;
    type?: string;
  };
  onSubmitSuccess: (data?: any) => any;
}

export interface IField {
  get_message?: {
    action: string;
    object_type: string;
    return_value?: string;
    message_data?: any;
  };
  canBeNull?: boolean;
  return_message?: { action: string; object_type: string; return_value?: string };
  style?: React.CSSProperties;
  type?: string;
  default_value?: string;
  items?: {
    value: string;
    icon_filename?: string;
    icon?: string;
    isDivider?: boolean;
    title?: string;
  }[];
  prefill?: any;
  name: string;
  mandatory?: boolean;
  placeholder?: string;
  selected?: boolean;
  fields?: string[];
  value?: any;
  isValid?: boolean;
  hasValueSet?: boolean;
  internal?: boolean;
  on_change?: string | string[];
  notify_on_remove?: boolean;
  notify_on_add?: boolean;
  markdown?: boolean;
  disabled?: boolean;
  requires_fields?: string[];
  resetClassConnections?: () => void;
  read_only?: boolean;
  reference?: {
    iface_kind: string;
    type?: string;
  };
  iface_kind?: string;
}

export declare type IFieldChange = (fieldName: string, value: any) => void;
