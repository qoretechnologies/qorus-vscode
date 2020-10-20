import { isArray } from 'util';
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
