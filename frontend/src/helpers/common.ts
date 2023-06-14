import { isArray } from 'util';
import { IField } from '../components/FieldWrapper';
import { TConfigItem } from '../containers/ConfigItemManager/filters';
import { postMessage } from '../hocomponents/withMessageHandler';

export const maybeSendOnChangeEvent = (field, value, type, interfaceId, sendResponse?: boolean) => {
  // Check if this field has an on_change message
  if (field.on_change) {
    // Check if on_change is a list
    const onChange: string[] = isArray(field.on_change) ? field.on_change : [field.on_change];
    // Post all the actions
    onChange.forEach((action) => {
      // Post the message with this handler
      postMessage(action, {
        [field.name]: value,
        [`orig_${field.name}`]: field.value,
        iface_kind: type,
        iface_id: interfaceId,
        send_response: sendResponse,
      });
    });
  }
};

export const mapFieldsToGroups = (fields: IField[]) => {
  const groups = {};

  fields.forEach((field) => {
    const group = field.group || field.name;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(field);
  });

  return groups;
};

export const getUniqueValuesFromConfigItemsByKey = (configItems: TConfigItem[], key: string) => {
  const uniqueValues = new Set();

  configItems.forEach((item) => {
    uniqueValues.add(item[key]);
  });

  return Array.from(uniqueValues);
};
