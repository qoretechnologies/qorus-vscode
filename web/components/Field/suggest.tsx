import React, { FunctionComponent, useState, useEffect } from 'react';
import { Select } from '@blueprintjs/select';
import { MenuItem, Button, Tooltip, ControlGroup, Classes, Callout, InputGroup } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { includes, get, size } from 'lodash';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import { TTranslator } from '../../App';
import withTextContext from '../../hocomponents/withTextContext';
import { compose } from 'recompose';
import StringField from './string';
import AutoComplete from 'react-autocomplete';

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
    const [items, setItems] = useState<any[]>(defaultItems || []);

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

    const handleChange: (item: any) => void = item => {
        console.log(item);
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

    return (
        <AutoComplete
            getItemValue={item => item}
            wrapperProps={{
                style: {
                    width: '100%',
                },
            }}
            inputProps={{
                placeholder: t('SelectExistingTypeOrNew'),
                style: {
                    width: '100%',
                    height: '30px',
                    outline: 'none',
                    border: 'none',
                    borderRadius: '3px',
                    boxShadow:
                        '0 0 0 0 rgba(92, 112, 128, 0), 0 0 0 0 rgba(92, 112, 128, 0), inset 0 0 0 1px rgba(16, 22, 26, 0.15), inset 0 1px 1px rgba(16, 22, 26, 0.2)',
                    background: '#ffffff',
                    padding: '0 10px',
                    verticalAlign: 'middle',
                    lineHeight: '30px',
                    color: '#182026',
                    fontSize: '14px',
                    fontWeight: '400',
                    transition: 'box-shadow 100ms cubic-bezier(0.4, 1, 0.75, 0.9)',
                },
            }}
            menuStyle={{
                borderRadius: '3px',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                border: '1px solid #eee',
                borderTop: 0,
                maxHeight: '300px',
                overflowY: 'auto',
            }}
            items={items}
            value={value}
            onChange={e => handleChange(e.target.value)}
            onSelect={val => handleChange(val)}
            renderItem={(item, isHighlighted) => (
                <div
                    style={{
                        padding: '0 10px',
                        height: '30px',
                        lineHeight: '30px',
                        backgroundColor: isHighlighted ? '#eee' : '#fff',
                        cursor: 'pointer',
                    }}
                >
                    {item}
                </div>
            )}
            shouldItemRender={(item, value) => item.toLowerCase().indexOf(value.toLowerCase()) > -1}
        />
    );
};

export default compose(withTextContext(), withMessageHandler())(SuggestField);
