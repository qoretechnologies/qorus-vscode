import { ButtonGroup } from '@blueprintjs/core';
import size from 'lodash/size';
import React, { FunctionComponent, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { Messages } from '../../constants/messages';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import SelectField from './select';

export interface IMapperCodeFieldProps {
  defaultCode?: string;
  defaultMethod?: string;
  onChange: IFieldChange;
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  selectedFields: any;
}

const MapperCodeField: FunctionComponent<IMapperCodeFieldProps> = ({
  defaultCode,
  defaultMethod,
  onChange,
  addMessageListener,
  postMessage,
  selectedFields,
}) => {
  const [methods, setMethods] = useState<any[]>(null);
  const [method, setMethod] = useState<string>(defaultMethod);

  useMount(() => {
    addMessageListener(Messages.RETURN_MAPPER_CODE_METHODS, (data) => {
      setMethods(data.methods);
    });
    // Check if default code exists
    if (defaultCode) {
      // Fetch the methods
      fetchMethods(defaultCode);
    }
  });

  const onCodeChange = (newCode) => {
    // Clear the methods
    setMethods(null);
    setMethod(null);
    onChange('code', `${newCode}`);
    // Fetch the methods
    fetchMethods(newCode);
  };

  const fetchMethods = (code: string): void => {
    postMessage(Messages.GET_MAPPER_CODE_METHODS, {
      name: code,
    });
  };

  return (
    <ButtonGroup>
      <SelectField
        name="code"
        value={defaultCode}
        onChange={(_name, value) => onCodeChange(value)}
        defaultItems={selectedFields.mapper.find((field: IField) => field.name === 'codes')?.value}
      />
      {size(methods) !== 0 && (
        <SelectField
          name="method"
          value={method}
          onChange={(_name, value) => {
            setMethod(value);
            onChange('code', `${defaultCode}::${value}`);
          }}
          defaultItems={methods}
        />
      )}
    </ButtonGroup>
  );
};

export default compose(withFieldsConsumer(), withMessageHandler())(MapperCodeField);
