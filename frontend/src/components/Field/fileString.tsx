import { ReqoreVerticalSpacer } from '@qoretechnologies/reqore';
import { FunctionComponent } from 'react';
import styled from 'styled-components';
import { IField } from '.';
import { TTranslator } from '../../App';
import { IFieldChange } from '../../components/FieldWrapper';
import { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import String from './string';
import TreeField from './tree';
import URLField from './urlField';

export interface IFileField {
  get_message?: { action: string; object_type: string };
  return_message?: { action: string; object_type: string; return_value: string };
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  name: string;
  t: TTranslator;
  includeInputField: boolean;
  label?: string;
  filesOnly?: string;
}

const Spacer = styled.div`
  margin: 5px;
`;

const FileField: FunctionComponent<IFileField & IField & IFieldChange> = ({
  onChange,
  name,
  value,
  default_value,
  canManageSourceDirs = true,
  includeInputField = false,

  ...rest
}) => {
  return (
    <>
      {includeInputField || rest.freeform ? (
        <>
          {rest.schemes ? (
            <URLField name={name} onChange={onChange} value={value} protocols={rest.schemes} />
          ) : (
            <String name={name} onChange={onChange} value={value} default_value={default_value} />
          )}
          <ReqoreVerticalSpacer height={10} />
        </>
      ) : null}
      <TreeField
        single
        onChange={(name, value) => onChange(name, rest.filesOnly ? `file://${value}` : value)}
        name={name}
        value={value}
        showValue={!rest.freeform}
        default_value={default_value}
        canManageSourceDirs={canManageSourceDirs}
        {...rest}
      />
    </>
  );
};

export default FileField;
