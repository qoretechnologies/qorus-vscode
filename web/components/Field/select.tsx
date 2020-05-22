import React, { FunctionComponent, useState, useEffect } from 'react';
import { Select } from '@blueprintjs/select';
import { MenuItem, Button, Tooltip, ControlGroup, Classes, Callout } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { includes, get, size } from 'lodash';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import { TTranslator } from '../../App';
import withTextContext from '../../hocomponents/withTextContext';
import { compose } from 'recompose';
import StringField from './string';
import FieldEnhancer from '../FieldEnhancer';
import { Messages } from '../../constants/messages';

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
    requestFieldData: (name: string, key?: string) => any;
    messageData: any;
    warningMessageOnEmpty?: string;
    autoSelect?: boolean;
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
    autoSelect,
    reference,
}) => {
    const [items, setItems] = useState<any[]>(defaultItems || []);
    const [query, setQuery] = useState<string>('');
    const [listener, setListener] = useState(null);
    const [hasProcessor, setHasProcessor] = useState<boolean>(false);

    useMount(() => {
        handleClick();
    });

    useEffect(() => {
        if (hasProcessor) {
            listener && listener();
            setListener(() =>
                addMessageListener(return_message.action, (data: any) => {
                    const newItems = get(data, 'objects');

                    if (data.object_type === 'processor-base-class') {
                        setItems(get(data, 'objects'));
                    }
                    // Check if the current value is a correct processor class
                    // Remove the value if not
                    if (value && !newItems.find((item) => item.name === value)) {
                        onChange(name, null);
                    }
                })
            );
        } else {
            listener && listener();
            setListener(() =>
                addMessageListener(return_message.action, (data: any) => {
                    // Check if this is the correct
                    // object type
                    if (!return_message.object_type || data.object_type === return_message.object_type) {
                        setItems(get(data, return_message.return_value));
                    }
                })
            );
        }
    }, [hasProcessor]);

    // Check if the processor field exists on every change
    useEffect(() => {
        if (requestFieldData) {
            setHasProcessor(requestFieldData('processor', 'selected'));
        } else {
            setHasProcessor(false);
        }
    });

    useEffect(() => {
        if (defaultItems) {
            setItems(defaultItems);
        }
    }, [defaultItems]);

    useEffect(() => {
        handleClick();
    }, [listener]);

    const handleEditSubmit: (_defaultName: string, val: string) => void = (_defaultName, val) => {
        handleSelectClick({ name: val });
        handleClick();
    };

    const handleSelectClick: (item: any) => void = (item) => {
        if (item === value) {
            return;
        }
        // Set the selected item
        onChange(name, item.name);
    };

    const handleClick: () => void = () => {
        if (hasProcessor) {
            // Get only the processor related classes
            postMessage('creator-get-objects', {
                object_type: 'processor-base-class',
                lang: requestFieldData('lang', 'value') || 'qore',
            });
        } else if (get_message) {
            get_message.message_data = get_message.message_data || {};
            // Get the list of items from backend
            postMessage(get_message.action, {
                object_type: get_message.object_type,
                data: { ...get_message.message_data },
                lang: requestFieldData ? requestFieldData('lang', 'value') : 'qore',
            });
        }
    };

    let filteredItems: any[] = items;

    // If we should run the items thru predicate
    if (predicate) {
        filteredItems = filteredItems.filter((item) => predicate(item.name));
    }

    if (!filteredItems || filteredItems.length === 0) {
        return <Callout intent="warning">{warningMessageOnEmpty || t('SelectNoItems')}</Callout>;
    }

    if (autoSelect && filteredItems.length === 1) {
        // Automaticaly select the first item
        if (filteredItems[0].name !== value) {
            handleSelectClick(filteredItems[0]);
        }
        // Show readonly string
        return <StringField value={value || filteredItems[0].name} read_only name={name} onChange={() => {}} />;
    }

    // Filter the items
    filteredItems =
        query === ''
            ? filteredItems
            : filteredItems.filter((item: any) => includes(item.name.toLowerCase(), query.toLowerCase()));

    return (
        <FieldEnhancer>
            {(onEditClick, onCreateClick) => (
                <ControlGroup fill>
                    <Select
                        items={filteredItems}
                        itemRenderer={(item, data) => (
                            <MenuItem
                                name={`field-${name}-item`}
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
                        className={Classes.FILL}
                        onItemSelect={(item: any) => handleSelectClick(item)}
                        query={query}
                        onQueryChange={(newQuery: string) => setQuery(newQuery)}
                        disabled={disabled}
                    >
                        <Button
                            name={`field-${name}`}
                            fill
                            text={value ? value : placeholder || t('PleaseSelect')}
                            rightIcon={'caret-down'}
                            onClick={handleClick}
                        />
                    </Select>
                    {reference && (
                        <>
                            {value && (
                                <Tooltip content={t('EditThisItem')}>
                                    <Button
                                        icon="edit"
                                        onClick={() => onEditClick(value, reference, handleEditSubmit)}
                                    />
                                </Tooltip>
                            )}
                            <Tooltip content={t('CreateAndAddNewItem')}>
                                <Button
                                    icon="add"
                                    intent="success"
                                    onClick={() => onCreateClick(reference, handleEditSubmit)}
                                />
                            </Tooltip>
                        </>
                    )}
                </ControlGroup>
            )}
        </FieldEnhancer>
    );
};

export default compose(withTextContext(), withMessageHandler())(SelectField);
