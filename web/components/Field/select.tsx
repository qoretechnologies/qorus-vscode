import React, { FunctionComponent, useState, useEffect } from 'react';
import { Select } from '@blueprintjs/select';
import { MenuItem, Button, Tooltip, ControlGroup, Classes, Callout } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { includes, get } from 'lodash';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import { TTranslator } from '../../App';
import withTextContext from '../../hocomponents/withTextContext';
import { compose } from 'recompose';

export interface ISelectField {
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
}

const SelectField: FunctionComponent<ISelectField & IField & IFieldChange> = ({
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
}) => {
    const [items, setItems] = useState<any[]>(defaultItems || []);
    const [query, setQuery] = useState<string>('');

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

    const handleSelectClick: (item: any) => void = item => {
        if (item === value) {
            return;
        }
        // Set the selected item
        onChange(name, item.name);
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

    if (items.length === 0 && !value) {
        return <Callout intent="warning">{warningMessageOnEmpty || t('SelectNoItems')}</Callout>;
    }

    // Filter the items
    let filteredItems: any[] =
        query === '' ? items : items.filter((item: any) => includes(item.name.toLowerCase(), query.toLowerCase()));

    // If we should run the items thru predicate
    if (predicate) {
        filteredItems = filteredItems.filter(item => predicate(item.name));
    }

    return (
        <Select
            items={filteredItems}
            itemRenderer={(item, data) => (
                <MenuItem
                    title={item.desc}
                    icon={value && item.name === value ? 'tick' : 'blank'}
                    text={item.name}
                    onClick={data.handleClick}
                />
            )}
            inputProps={{
                placeholder: t('Filter'),
            }}
            popoverProps={{
                popoverClassName: 'custom-popover',
                targetClassName: fill ? 'select-popover' : '',
                position: 'left',
            }}
            className={fill ? 'select-field' : ''}
            onItemSelect={(item: any) => handleSelectClick(item)}
            query={query}
            onQueryChange={(newQuery: string) => setQuery(newQuery)}
            disabled={disabled}
        >
            <Button
                text={value ? value : placeholder || t('PleaseSelect')}
                rightIcon={'caret-down'}
                onClick={handleClick}
            />
        </Select>
    );
};

export default compose(withTextContext(), withMessageHandler())(SelectField);
