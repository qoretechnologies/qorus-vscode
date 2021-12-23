import { Button, Callout, ControlGroup, InputGroup } from '@blueprintjs/core';
import cronstrue from 'cronstrue';
import React, { ChangeEvent, FunctionComponent } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import { getValueOrDefaultValue } from '../../helpers/validations';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';

export interface ICronField {
  t?: TTranslator;
  fill?: boolean;
  postMessage?: TPostMessage;
  addMessageListener?: TMessageListener;
}

const CronField: FunctionComponent<ICronField & IField & IFieldChange> = ({
  name,
  onChange,
  value = '',
  default_value,
  fill,
  postMessage,
  addMessageListener,
  get_message,
  return_message,
}) => {
  // Fetch data on mount
  useMount(() => {
    // Populate default value
    if (getValueOrDefaultValue(value, default_value, false)) {
      onChange(name, getValueOrDefaultValue(value, default_value, false));
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
  const handleInputChange = (fieldName: string, newValue: string): void => {
    const cronData: { [key: string]: any } = {};
    // Fill the cron data object with the values
    [
      cronData.minute = '',
      cronData.hour = '',
      cronData.day = '',
      cronData.month = '',
      cronData.weekday = '',
    ] = value.split(' ');
    // Set the field
    cronData[fieldName] = newValue;
    // Update the field
    onChange(
      name,
      `${cronData.minute} ${cronData.hour} ${cronData.day} ${cronData.month} ${cronData.weekday}`
    );
  };

  // Clear the input on reset click
  const handleResetClick = (): void => {
    onChange(name, '');
  };

  const [minute = '', hour = '', day = '', month = '', weekday = ''] = value.split(' ');

  // Create the readable CRON message
  let message: string = '';
  let isError = false;

  try {
    message = cronstrue.toString(value);
  } catch (e) {
    message = e;
    isError = true;
  }

  return (
    <>
      <ControlGroup fill>
        <InputGroup
          name={'field-cron-minute'}
          value={minute}
          placeholder={'Minute'}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleInputChange('minute', event.target.value.trim());
          }}
        />
        <InputGroup
          name={'field-cron-hour'}
          value={hour}
          placeholder={'Hour'}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleInputChange('hour', event.target.value.trim());
          }}
        />
        <InputGroup
          name={'field-cron-day'}
          value={day}
          placeholder={'Day'}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleInputChange('day', event.target.value.trim());
          }}
        />
        <InputGroup
          name={'field-cron-month'}
          value={month}
          placeholder={'Month'}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleInputChange('month', event.target.value.trim());
          }}
        />
        <InputGroup
          name={'field-cron-weekday'}
          value={weekday}
          placeholder={'Weekday'}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleInputChange('weekday', event.target.value.trim());
          }}
        />
        <Button onClick={handleResetClick} icon={'cross'} />
      </ControlGroup>
      <Callout intent={isError ? 'danger' : 'primary'}>{message}</Callout>
    </>
  );
};

export default compose(withMessageHandler(), withTextContext())(CronField) as FunctionComponent<
  ICronField & IField & IFieldChange
>;
