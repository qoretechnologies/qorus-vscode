import { ReqoreInput } from '@qoretechnologies/reqore';
import { ChangeEvent, FunctionComponent } from 'react';
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
  ...rest
}) => {
  // Fetch data on mount
  useMount(() => {
    // Populate default value
    if (value || default_value) {
      handleChange(value || default_value);
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

  const handleChange = (value: number | string): void => {
    onChange(
      name,
      type === 'int' || type === 'number'
        ? parseInt(value as string, 10)
        : parseFloat(value as string)
    );
  };

  // When input value changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleChange(event.target.value);
  };

  // Clear the input on reset click
  const handleResetClick = (): void => {
    onChange(name, null);
  };

  return (
    <ReqoreInput
      {...rest}
      fluid={fill}
      value={value ?? default_value ?? ''}
      onChange={handleInputChange}
      type="number"
      // @ts-ignore
      step={type === 'int' || type === 'number' ? 1 : 0.1}
      onClearClick={handleResetClick}
    />
  );
};

export default compose(withMessageHandler(), withTextContext())(NumberField) as FunctionComponent<
  INumberField & IField
>;
