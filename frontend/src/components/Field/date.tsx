import { ReqoreInput, useReqoreTheme } from '@qoretechnologies/reqore';
import { FunctionComponent } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { getValueOrDefaultValue } from '../../helpers/validations';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';

export interface IDateField {
  t?: TTranslator;
  fill?: boolean;
  postMessage?: TPostMessage;
  addMessageListener?: TMessageListener;
}

let StyledDateField;
if (!!StyledDateField) {
  StyledDateField = styled(ReqoreInput)`
    cursor: pointer;
    &::-webkit-calendar-picker-indicator {
      filter: invert(1);
    }
  `;
}

const DateField: FunctionComponent<IDateField & IField & IFieldChange> = ({
  name,
  onChange,
  value,
  default_value,
  postMessage,
  addMessageListener,
  get_message,
  return_message,
  t,
  disabled,
}) => {
  const theme = useReqoreTheme();
  // Fetch data on mount
  useMount(() => {
    // Populate default value
    if (default_value) {
      onChange(name, getValueOrDefaultValue(value, default_value || new Date(), false));
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
  const handleInputChange = (event: any): void => {
    onChange(name, event.target.value);
  };

  // Clear the input on reset click
  const handleResetClick = (): void => {
    onChange(name, null);
  };

  return (
    <StyledDateField
      theme={theme}
      // @ts-ignore
      type="datetime-local"
      disabled={disabled}
      placeholder={'YYYY-MM-DDT00:00:00Z'}
      fluid
      value={!value && !default_value ? undefined : value || default_value}
      onChange={handleInputChange}
      onClearClick={handleResetClick}
    />
  );

  // return (
  //   <ReqoreInput
  //     timePickerProps={{}}
  //     closeOnSelection={false}
  //     disabled={disabled}
  //     formatDate={(date) => date.toLocaleString()}
  //     parseDate={(str) => new Date(str)}
  //     placeholder={'YYYY-MM-DDT00:00:00Z'}
  //     invalidDateMessage={t('InvalidDate')}
  //     inputProps={{ className: Classes.FILL }}
  //     //defaultValue={new Date()}
  //     popoverProps={{
  //       targetTagName: 'div',
  //       wrapperTagName: 'div',
  //     }}
  //     value={!value && !default_value ? null : new Date(value || default_value)}
  //     onChange={handleInputChange}
  //     rightElement={
  //       value &&
  //       value !== '' && (
  //         <ButtonGroup minimal>
  //           <Button onClick={handleResetClick} icon={'cross'} />
  //         </ButtonGroup>
  //       )
  //     }
  //   />
  // );
};

export default compose(withMessageHandler(), withTextContext())(DateField) as FunctionComponent<
  IDateField & IField & IFieldChange
>;
