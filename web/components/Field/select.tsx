import React, { FunctionComponent, useState, useEffect } from 'react';
import { Select } from '@blueprintjs/select';
import { MenuItem, Button, Tooltip } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { includes } from 'lodash';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import { TTranslator } from '../../App';

export interface ISelectField {
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    t: TTranslator;
}

const SelectField: FunctionComponent<ISelectField & IField & IFieldChange> = ({
    get_message,
    return_message,
    addMessageListener,
    postMessage,
    name,
    onChange,
    value,
    t,
}) => {
    const [items, setItems] = useState<any[]>([]);
    const [query, setQuery] = useState<string>('');

    useMount(() => {
        addMessageListener(return_message.action, (data: any) => {
            // Check if this is the correct
            // object type
            if (data.object_type === return_message.object_type) {
                setItems(data[return_message.return_value]);
            }
        });
    });

    const handleSelectClick: (item: any) => void = item => {
        // Set the selected item
        onChange(name, item.name);
    };

    const handleClick: () => void = () => {
        // Get the list of items from backend
        postMessage(get_message.action, { object_type: get_message.object_type });
    };

    // Filter the items
    const filteredItems: any[] =
        query === '' ? items : items.filter((item: any) => includes(item.name.toLowerCase(), query.toLowerCase()));

    return (
        <Select
            items={filteredItems}
            itemRenderer={(item, data) => (
                <Tooltip content={item.desc}>
                    <MenuItem
                        icon={value && item.name === value ? 'tick' : 'blank'}
                        text={item.name}
                        onClick={data.handleClick}
                    />
                </Tooltip>
            )}
            inputProps={{
                placeholder: t('Filter'),
            }}
            onItemSelect={(item: any) => handleSelectClick(item)}
            query={query}
            onQueryChange={(newQuery: string) => setQuery(newQuery)}
        >
            <Button text={value ? value : t('PleaseSelect')} rightIcon={'caret-down'} onClick={handleClick} />
        </Select>
    );
};

export default withMessageHandler()(SelectField);
