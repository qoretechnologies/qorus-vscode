import { Button, ButtonGroup, Classes, InputGroup } from '@blueprintjs/core';
import React, { ChangeEvent, FunctionComponent } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';

export interface INumberField {
  t?: TTranslator;
  fill?: boolean;
  postMessage?: TPostMessage;
  addMessageListener?: TMessageListener;
}

const NumberField: FunctionComponent<INumberField & IField & IFieldChange> = ({
  name,
  onChange,
  value,
  default_value,
  type,
  fill,
  postMessage,
  addMessageListener,
  get_message,
  return_message,
}) => {
  // Fetch data on mount
  useMount(() => {
    // Populate default value
    if (value || default_value) {
      onChange(name, value || default_value);
    }
    // Get backend data
    if (get_message && return_message) {
      postMessage(get_message.action);
      addMessageListener(return_message.action, (data: any) => {
        if (data) {
          onChange(name, data[return_message.return_value]);
        }
      });
    }
  });

  // When input value changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(
      name,
      type === 'int' || type === 'number'
        ? parseInt(event.target.value, 10)
        : parseFloat(event.target.value)
    );
  };

  // Clear the input on reset click
  const handleResetClick = (): void => {
    onChange(name, null);
  };

  return (
    <InputGroup
      name={`field-${name}`}
      className={fill && Classes.FILL}
      value={value ?? default_value ?? ''}
      onChange={handleInputChange}
      type="number"
      step={type === 'int' || type === 'number' ? 1 : 0.1}
      rightElement={
        (value && value !== '') || value === 0 ? (
          <ButtonGroup minimal>
            <Button onClick={handleResetClick} icon={'cross'} />
          </ButtonGroup>
        ) : null
      }
    />
  );
};

export default compose(withMessageHandler(), withTextContext())(NumberField) as FunctionComponent<
  INumberField & IField & IFieldChange
>;
