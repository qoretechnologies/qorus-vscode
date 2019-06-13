import React, { FunctionComponent, useState, useEffect } from 'react';
import compose from 'recompose/compose';
import { Select, MultiSelect } from '@blueprintjs/select';
import { MenuItem, Button, Tooltip, Tag } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { includes, size } from 'lodash';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import { TTranslator } from '../../App';
import withTextContext from '../../hocomponents/withTextContext';

export interface IMultiSelectField {
    get_message: { action: string; object_type: string };
    return_message: { action: string; object_type: string; return_value: string };
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    name: string;
    t: TTranslator;
    simple: boolean;
}

const MultiSelectField: FunctionComponent<IMultiSelectField & IField & IFieldChange> = ({
    get_message,
    return_message,
    addMessageListener,
    postMessage,
    onChange,
    name,
    value = [],
    t,
    simple,
}) => {
    const [items, setItems] = useState<any[]>([]);

    useMount(() => {
        if (!simple) {
            //
            postMessage(get_message.action, { object_type: get_message.object_type });
            addMessageListener(return_message.action, (data: any) => {
                // Check if this is the correct
                // object type
                if (data.object_type === return_message.object_type) {
                    setItems(data[return_message.return_value]);
                }
            });
        }
    });

    const setSelectedItems = (newValue: string[]) => {
        // Send the selected items whenever they change
        onChange(name, newValue);
    };

    const handleSelectClick: (item: any) => void = item => {
        // Check if this item is selected
        const isSelected: boolean = !!value.find((selectedItem: any) => selectedItem.name === item.name);
        // Remove the item if it's selected
        if (isSelected) {
            deselectItem(item.name);
        } else {
            // Check if this item was created by the user
            const existsInItems: boolean = !!items.find((selectedItem: any) => selectedItem.name === item.name);
            // Add the item if it does not exist
            if (!existsInItems) {
                setItems(currentItems => [...currentItems, item]);
            }
            // Set the selected item
            setSelectedItems([...value, item]);
        }
    };

    const handleTagRemoveClick: (tag: string) => void = tag => {
        deselectItem(tag);
    };

    const handleClearClick: () => void = () => {
        setSelectedItems([]);
    };

    const deselectItem: (name: string) => void = name => {
        setSelectedItems(value.filter((item: any) => item.name !== name));
    };

    // Clear button
    const ClearButton = size(value) ? <Button icon={'cross'} minimal onClick={handleClearClick} /> : undefined;

    console.log(value);

    return (
        <MultiSelect
            items={items}
            createNewItemFromQuery={(query: string) => ({
                name: query,
            })}
            createNewItemRenderer={(query, _active, handleClick) => (
                <MenuItem icon={'add'} text={`${t('AddNew')} ${query}`} onClick={handleClick} />
            )}
            itemRenderer={(item, { handleClick }) => (
                <Tooltip content={item.desc}>
                    <MenuItem icon={includes(value, item) ? 'tick' : 'blank'} text={item.name} onClick={handleClick} />
                </Tooltip>
            )}
            popoverProps={{ targetClassName: 'select-popover' }}
            tagRenderer={item => item.name}
            tagInputProps={{
                onRemove: handleTagRemoveClick,
                fill: true,
                rightElement: ClearButton,
                leftIcon: 'list',
                tagProps: {
                    minimal: true,
                },
            }}
            selectedItems={value}
            onItemSelect={(item: any) => handleSelectClick(item)}
            resetOnQuery
            resetOnSelect
            activeItem={null}
        />
    );
};

export default compose(
    withTextContext(),
    withMessageHandler()
)(MultiSelectField);
