import { ReqoreMultiSelect } from '@qoretechnologies/reqore';
import { get, size } from 'lodash';
import { FunctionComponent, useEffect, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import { compose } from 'recompose';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';

export interface ISuggestField {
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  t: TTranslator;
  defaultItems?: any[];
  predicate: (name: string) => boolean;
  placeholder: string;
  fill?: boolean;
  disabled?: boolean;
  position?: any;
  requestFieldData: (name: string, key: string) => IField;
  messageData: any;
  warningMessageOnEmpty?: string;
  autoSelect?: boolean;
}

const SuggestField: FunctionComponent<ISuggestField & IField & IFieldChange> = ({
  get_message,
  return_message,
  addMessageListener,
  postMessage,
  name,
  onChange,
  value,
  defaultItems,
  t,
  predicate,
  placeholder,
  fill,
  disabled,
  requestFieldData,
  warningMessageOnEmpty,
  autoSelect,
}) => {
  const [items, setItems] = useState<string[]>(defaultItems || []);

  useMount(() => {
    if (return_message) {
      addMessageListener(return_message.action, (data: any) => {
        // Check if this is the correct
        // object type
        if (!return_message.object_type || data.object_type === return_message.object_type) {
          setItems(get(data, return_message.return_value));
        }
      });
    }

    handleClick();
  });

  useEffect(() => {
    if (defaultItems) {
      setItems(defaultItems);
    }
  }, [defaultItems]);

  const handleChange: (item: string) => void = (item) => {
    if (item === value) {
      return;
    }
    // Set the selected item
    onChange(name, item);
  };

  const handleClick: () => void = () => {
    if (get_message) {
      get_message.message_data = get_message.message_data || {};
      // Get the list of items from backend
      postMessage(get_message.action, {
        object_type: get_message.object_type,
        data: { ...get_message.message_data },
        lang: requestFieldData ? requestFieldData('lang', 'value') : 'qore',
      });
    }
  };

  console.log('value', value);

  return (
    <ReqoreMultiSelect
      items={[value, ...items].map((item) => ({
        label: item,
        value: item,
        wrap: true,
        tooltip: {
          content: item,
          delay: 200,
        },
      }))}
      onValueChange={(val) => {
        if (size(val) > 1) {
          // Get the last item
          handleChange(val[size(val) - 1]);
        } else {
          handleChange(val[0]);
        }
      }}
      value={value ? [value] : undefined}
      canCreateItems
    />
  );
};

export default compose(withTextContext(), withMessageHandler())(SuggestField);
