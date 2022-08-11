import { TextArea } from '@blueprintjs/core';
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

export interface ITextareaField {
  t?: TTranslator;
  fill?: boolean;
  postMessage?: TPostMessage;
  addMessageListener?: TMessageListener;
}

const TextareaField: FunctionComponent<ITextareaField & IField & IFieldChange> = ({
  name,
  onChange,
  value,
  default_value,
  fill,
  postMessage,
  addMessageListener,
  get_message,
  return_message,
  placeholder,
}) => {
  // Fetch data on mount
  useMount(() => {
    // Populate default value
    if (default_value) {
      onChange(name, default_value);
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
    onChange(name, event.target.value);
  };

  // Clear the input on reset click
  const handleResetClick = (): void => {
    onChange(name, '');
  };

  return (
    <TextArea
      placeholder={placeholder}
      fill={fill}
      value={!value ? default_value || '' : value}
      onChange={handleInputChange}
    />
  );
};

export default compose(withMessageHandler(), withTextContext())(TextareaField) as FunctionComponent<
  ITextareaField & IField & IFieldChange
>;
