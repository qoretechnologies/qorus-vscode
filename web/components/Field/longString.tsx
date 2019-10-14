import React, { FunctionComponent, ChangeEvent } from 'react';
import { Classes, TextArea } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import compose from 'recompose/compose';
import useMount from 'react-use/lib/useMount';
import withMessageHandler, { TPostMessage, TMessageListener } from '../../hocomponents/withMessageHandler';
import { getLineCount } from '../Tree';

export interface ILongStringField {
    t?: TTranslator;
    fill?: boolean;
    postMessage?: TPostMessage;
    addMessageListener?: TMessageListener;
}

const LongStringField: FunctionComponent<ILongStringField & IField & IFieldChange> = ({
    name,
    onChange,
    value,
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
        onChange(name, event.target.value);
    };

    // Clear the input on reset click
    const handleResetClick = (): void => {
        onChange(name, '');
    };

    return (
        <TextArea
            style={{
                width: '100%',
                resize: 'none',
            }}
            rows={getLineCount(value || default_value || '') + 1}
            className={fill && Classes.FILL}
            value={!value ? default_value || '' : value}
            onChange={handleInputChange}
        />
    );
};

export default compose(
    withMessageHandler(),
    withTextContext()
)(LongStringField) as FunctionComponent<ILongStringField & IField & IFieldChange>;
