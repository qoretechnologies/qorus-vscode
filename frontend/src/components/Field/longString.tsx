import { ReqoreTextarea } from '@qoretechnologies/reqore';
import { ChangeEvent, FunctionComponent } from 'react';
import useMount from 'react-use/lib/useMount';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import {
  TMessageListener,
  TPostMessage,
  addMessageListener,
  postMessage,
} from '../../hocomponents/withMessageHandler';

export interface ILongStringField {
  t?: TTranslator;
  fill?: boolean;
  postMessage?: TPostMessage;
  addMessageListener?: TMessageListener;
  placeholder?: string;
  noWrap?: boolean;
  onChange: IFieldChange;
  id?: string;
}

const LongStringField: FunctionComponent<ILongStringField & IField> = ({
  name,
  onChange,
  value,
  default_value,
  fill,
  get_message,
  return_message,
  placeholder,
  intent,
  noWrap,
  id,
  disabled,
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
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange(name, event.target.value.toString());
  };

  return (
    <ReqoreTextarea
      placeholder={placeholder}
      scaleWithContent
      fluid
      value={!value ? default_value || '' : value}
      onChange={handleInputChange}
      onClearClick={() => onChange(name, '')}
      intent={intent}
      id={id}
      disabled={disabled}
    />
  );
};

export default LongStringField;
