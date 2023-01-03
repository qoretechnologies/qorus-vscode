import { ReqoreControlGroup } from '@qoretechnologies/reqore';
import { IReqoreControlGroupProps } from '@qoretechnologies/reqore/dist/components/ControlGroup';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';

export const FieldWrapper = styled.div<{ padded?: boolean }>`
  display: flex;
  flex-flow: row;
  padding: 15px ${({ padded }) => (padded ? '20px' : 0)};
  flex: none;

  &:nth-child(even) {
    background-color: #00000040;
  }
`;

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
  overflow-x: auto;
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
  style?: string;
  type: string;
  default_value?: string;
  items?: { value: string; icon_filename: string }[];
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
