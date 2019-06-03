import React, { FunctionComponent, useState, useEffect } from 'react';
import { Select, MultiSelect } from '@blueprintjs/select';
import { MenuItem, Button, Tooltip, Tag } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { includes, size } from 'lodash';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';

export interface IMultiSelectField {
    get_message: { action: string; object_type: string };
    return_message: { action: string; object_type: string; return_value: string };
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    name: string;
    onChange: (fieldName: string, value: any) => void;
}

const MultiSelectField: FunctionComponent<IMultiSelectField> = ({
    get_message,
    return_message,
    addMessageListener,
    postMessage,
    onChange,
    name,
}) => {
    const [items, setItems] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<any>([]);
    const [query, setQuery] = useState<string>('');

    useMount(() => {
        //
        postMessage(get_message.action, { object_type: get_message.object_type });
        addMessageListener(return_message.action, (data: any) => {
            // Check if this is the correct
            // object type
            if (data.object_type === return_message.object_type) {
                setItems(data[return_message.return_value]);
            }
        });
    });

    useEffect(() => {
        // Send the selected items whenever they change
        onChange(name, selectedItems.map(item => item.name));
    }, [selectedItems]);

    const handleSelectClick: (item: any) => void = item => {
        // Check if this item is selected
        const isSelected: boolean = !!selectedItems.find((selectedItem: any) => selectedItem.name === item.name);
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
            setSelectedItems((currentItems: any[]) => [...currentItems, item]);
        }
    };

    const handleTagRemoveClick: (tag: string) => void = tag => {
        deselectItem(tag);
    };

    const handleClearClick: () => void = () => {
        setSelectedItems([]);
    };

    const deselectItem: (name: string) => void = name => {
        setSelectedItems((currentItems: any[]) => currentItems.filter((item: any) => item.name !== name));
    };

    // Filter the items
    const filteredItems: any[] =
        query === '' ? items : items.filter((item: any) => includes(item.name.toLowerCase(), query.toLowerCase()));

    // Clear button
    const ClearButton = size(selectedItems) ? <Button icon="cross" minimal onClick={handleClearClick} /> : undefined;

    return (
        <MultiSelect
            items={filteredItems}
            createNewItemFromQuery={(query: string) => ({
                name: query,
            })}
            createNewItemRenderer={(query, _active, handleClick) => (
                <MenuItem icon="add" text={`Add new ${query}`} onClick={handleClick} />
            )}
            itemRenderer={(item, { handleClick }) => (
                <Tooltip content={item.desc}>
                    <MenuItem
                        icon={includes(selectedItems, item) ? 'tick' : 'blank'}
                        text={item.name}
                        onClick={handleClick}
                    />
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
            selectedItems={selectedItems}
            onItemSelect={(item: any) => handleSelectClick(item)}
            resetOnQuery
            resetOnSelect
            activeItem={null}
        />
    );
};

export default withMessageHandler()(MultiSelectField);
