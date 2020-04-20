import React, { FunctionComponent, useState } from 'react';

import { includes, size } from 'lodash';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';

import { Button, ControlGroup, Icon, MenuItem, Tag } from '@blueprintjs/core';
import { MultiSelect } from '@blueprintjs/select';

import { TTranslator } from '../../App';
import { StyledDialogBody } from '../../containers/ClassConnectionsManager';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import CustomDialog from '../CustomDialog';
import { IField } from './';
import String from './string';

export interface IMultiSelectField {
    get_message: { action: string; object_type: string };
    return_message: { action: string; object_type: string; return_value: string };
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    name: string;
    t: TTranslator;
    simple: boolean;
    activeId: number;
    default_items?: [];
    canEdit?: boolean;
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
    activeId,
    default_items,
    removeCodeFromRelations,
    canEdit,
}) => {
    const [items, setItems] = useState<any[]>(default_items || []);
    const [editorManager, setEditorManager] = useState<any>({});

    useMount(() => {
        if (!simple) {
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
        console.log(tag);
        deselectItem(tag);
    };

    const handleTagClick: (tag: string) => void = tag => {
        setEditorManager({
            isOpen: true,
            defaultValue: tag,
            value: tag,
        });
    };

    const handleSaveTagEdit: () => void = () => {
        const newItems = items.reduce((modifiedItems: any[], item: any) => {
            const newItem = { ...item };
            // Check if the item matches the default value of the edite item
            if (item.name === editorManager.defaultValue) {
                newItem.name = editorManager.value;
            }

            return [...modifiedItems, newItem];
        }, []);

        setEditorManager({});
        setSelectedItems(newItems);
    };

    const handleClearClick: () => void = () => {
        setSelectedItems([]);
    };

    const deselectItem: (tagName: string) => void = tagName => {
        tagName = tagName.props.children;
        // If this is the mapper code field
        // remove the selected mapper code from relations
        if (name === 'codes') {
            removeCodeFromRelations([tagName]);
        }
        // Remove tag
        setSelectedItems(value.filter((item: any) => item.name !== tagName));
    };

    // Clear button
    const ClearButton = size(value) ? <Button icon={'cross'} minimal onClick={handleClearClick} /> : undefined;

    return (
        <>
            {editorManager.isOpen && (
                <CustomDialog title={t('EditItem')} onClose={() => setEditorManager({})} isOpen>
                    <StyledDialogBody>
                        <ControlGroup fill>
                            <String
                                fill
                                name="edit"
                                value={editorManager.value}
                                onChange={(_name, value) => setEditorManager({ ...editorManager, value })}
                            />

                            <Button
                                text={t('Save')}
                                onClick={handleSaveTagEdit}
                                disabled={editorManager.value === ''}
                                intent="success"
                            />
                        </ControlGroup>
                    </StyledDialogBody>
                </CustomDialog>
            )}
            <MultiSelect
                key={activeId}
                items={items}
                createNewItemFromQuery={(query: string) =>
                    query
                        ? {
                              name: query,
                          }
                        : undefined
                }
                createNewItemRenderer={(query, _active, handleClick) => (
                    <MenuItem icon={'add'} text={`${t('AddNew')} ${query}`} onClick={handleClick} />
                )}
                itemRenderer={(item, { handleClick }) => (
                    <MenuItem
                        icon={includes(value, item) ? 'tick' : 'blank'}
                        text={item.name}
                        onClick={handleClick}
                        title={item.desc}
                    />
                )}
                popoverProps={{ targetClassName: 'select-popover', popoverClassName: 'custom-popover' }}
                tagRenderer={item => (
                    <Tag
                        minimal
                        style={{ cursor: 'pointer', backgroundColor: 'transparent' }}
                        onClick={event => {
                            if (canEdit) {
                                event.stopPropagation();
                                handleTagClick(item.name);
                            }
                        }}
                        rightIcon={canEdit && <Icon iconSize={12} icon="edit" style={{ opacity: '0.6' }} />}
                    >
                        {item.name}
                    </Tag>
                )}
                tagInputProps={{
                    onRemove: handleTagRemoveClick,
                    fill: true,
                    rightElement: ClearButton,
                    leftIcon: 'list',
                    tagProps: {
                        minimal: true,
                    },
                }}
                selectedItems={value || []}
                onItemSelect={(item: any) => handleSelectClick(item)}
                resetOnQuery
                resetOnSelect
                activeItem={null}
            />
        </>
    );
};

export default compose(
    withTextContext(),
    withMessageHandler(),
    withMapperConsumer(),
    onlyUpdateForKeys(['value', 'activeId'])
)(MultiSelectField);
