import { FunctionComponent } from 'react';

import styled from 'styled-components';

import { TTranslator } from '../../App';
import { IFieldChange } from '../../components/FieldWrapper';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import { IField } from './';
import MultiSelect from './multiSelect';
import TreeField from './tree';

export interface IMultiFileField {
  get_message: { action: string; object_type: string };
  return_message: { action: string; object_type: string; return_value: string };
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  name: string;
  t: TTranslator;
}

const Spacer = styled.div`
  margin: 5px;
`;

const MultiFileField: FunctionComponent<IMultiFileField & IField & IFieldChange> = ({
  onChange,
  name,
  value = [],
  ...rest
}) => {
  return (
    <>
      <MultiSelect
        simple
        name={name}
        onChange={onChange}
        value={value}
        canEdit
        default_items={(value || []).map((val) => ({ name: val.name || val }))}
      />
      <Spacer />
      <TreeField onChange={onChange} name={name} value={value} {...rest} />
    </>
  );
};

export default withMessageHandler()(MultiFileField);
