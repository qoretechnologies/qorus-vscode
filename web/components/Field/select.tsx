import { Button, Callout, Classes, ControlGroup, Icon, MenuItem, Tooltip } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { get, includes } from 'lodash';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import useMount from 'react-use/lib/useMount';
import { compose } from 'recompose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import CustomDialog from '../CustomDialog';
import FieldEnhancer from '../FieldEnhancer';
import Spacer from '../Spacer';
import StringField from './string';

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

const StyledDialogSelectItem = styled.div`
    &:not(:last-child) {
        margin-bottom: 10px;
    }

    background-color: #fff;

    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    transition: all 0.2s;

    &:hover,
    &.selected {
        cursor: pointer;
        transform: scale(1.02);
        box-shadow: 0 0 10px -6px #555;
    }

    &.selected {
        border: 1px solid #7fba27;
    }

    h5 {
        margin: 0;
        padding: 0;
        font-size: 14px;
    }

    p {
        margin: 0;
        padding: 0;
        font-size: 12px;
    }
`;

const SelectField: React.FC<ISelectField & IField & IFieldChange> = ({
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
    iface_kind,
    context,
    editOnly,
}) => {
    const [items, setItems] = useState<any[]>(defaultItems || []);
    const [query, setQuery] = useState<string>('');
    const [isSelectDialogOpen, setSelectDialogOpen] = useState<boolean>(false);
    const [listener, setListener] = useState(null);
    const [hasProcessor, setHasProcessor] = useState<boolean>(
        requestFieldData ? requestFieldData('processor', 'selected') : false
    );
    const [isProcessorSelected, setIsProcessorSelected] = useState<boolean>(
        requestFieldData ? requestFieldData('processor', 'selected') : false
    );

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

                        // Check if the current value is a correct processor class
                        // Remove the value if not
                        if (value && !newItems.find((item) => item.name === value)) {
                            onChange(name, null);
                        } else {
                            onChange(name, value);
                        }
                    }
                })
            );
        } else {
            listener && listener();
            if (return_message) {
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
        }
    }, [hasProcessor]);

    useEffect(() => {
        setIsProcessorSelected(requestFieldData ? requestFieldData('processor', 'selected') : false);
    });

    // Check if the processor field exists on every change
    useEffect(() => {
        if (isProcessorSelected) {
            if (!hasProcessor) {
                setHasProcessor(true);
            }
        } else {
            if (hasProcessor) {
                setHasProcessor(false);
            }
        }
    }, [isProcessorSelected]);

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
        let className: string;

        if (requestFieldData) {
            const classClassName = requestFieldData('class-class-name', 'value');
            const cName = requestFieldData('class-name', 'value');

            className = classClassName || cName;
        }

        if (hasProcessor) {
            // Get only the processor related classes
            postMessage('creator-get-objects', {
                object_type: 'processor-base-class',
                lang: requestFieldData('lang', 'value') || 'qore',
                iface_kind,
                class_name: className,
            });
        } else if (get_message) {
            get_message.message_data = get_message.message_data || {};
            // Get the list of items from backend
            postMessage(get_message.action, {
                object_type: get_message.object_type,
                data: { ...get_message.message_data },
                lang: requestFieldData ? requestFieldData('lang', 'value') : 'qore',
                iface_kind,
                class_name: className,
            });
        }
    };

    let filteredItems: any[] = items;

    // If we should run the items thru predicate
    if (predicate) {
        filteredItems = filteredItems.filter((item) => predicate(item.name));
    }

    if (autoSelect && filteredItems.length === 1) {
        // Automaticaly select the first item
        if (filteredItems[0].name !== value) {
            handleSelectClick(filteredItems[0]);
        }
        // Show readonly string
        return <StringField value={value || filteredItems[0].name} read_only name={name} onChange={() => {}} />;
    }

    if (!reference && (!filteredItems || filteredItems.length === 0)) {
        return <Callout intent="warning">{warningMessageOnEmpty || t('SelectNoItems')}</Callout>;
    }

    const hasItemsWithDesc = (data) => {
        return data.some((item) => item.desc);
    };

    const filterItems = (items) => {
        return items.filter((item: any) => includes(item.name.toLowerCase(), query.toLowerCase()));
    };

    const getItemDescription = (itemName) => {
        return items.find((item) => item.name === itemName)?.desc;
    };

    return (
        <FieldEnhancer context={{ iface_kind, ...context }}>
            {(onEditClick, onCreateClick) => (
                <ControlGroup fill={fill}>
                    {!filteredItems || filteredItems.length === 0 ? (
                        <StringField value={t('NothingToSelect')} read_only disabled name={name} onChange={() => {}} />
                    ) : (
                        <>
                            {hasItemsWithDesc(items) ? (
                                <>
                                    <Tooltip
                                        targetProps={{
                                            style: {
                                                width: '100%',
                                            },
                                        }}
                                        content={
                                            <ReactMarkdown
                                                source={
                                                    value
                                                        ? getItemDescription(value) || t('NoDescription')
                                                        : t('PleaseSelect')
                                                }
                                            />
                                        }
                                    >
                                        <Button
                                            name={`field-${name}`}
                                            fill={fill}
                                            text={value ? value : placeholder || t('PleaseSelect')}
                                            rightIcon="widget-header"
                                            onClick={() => setSelectDialogOpen(true)}
                                        />
                                    </Tooltip>
                                    {isSelectDialogOpen && (
                                        <CustomDialog
                                            isOpen
                                            icon="list"
                                            onClose={() => {
                                                setSelectDialogOpen(false);
                                                setQuery('');
                                            }}
                                            title={t('SelectItem')}
                                            style={{
                                                maxHeight: '50vh',
                                                overflow: 'auto',
                                                padding: 0,
                                            }}
                                        >
                                            <div className={Classes.DIALOG_BODY}>
                                                <StringField
                                                    onChange={(_name, value) => setQuery(value)}
                                                    value={query}
                                                    name="select-filter"
                                                    placeholder={t('Filter')}
                                                    autoFocus
                                                />
                                                <Spacer size={10} />
                                                {filterItems(filteredItems).map((item) => (
                                                    <StyledDialogSelectItem
                                                        className={item.name === value ? 'selected' : ''}
                                                        name={`field-${name}-item`}
                                                        onClick={() => {
                                                            handleSelectClick(item);
                                                            setSelectDialogOpen(false);
                                                            setQuery('');
                                                        }}
                                                    >
                                                        <h5>
                                                            {item.name === value && (
                                                                <Icon icon="small-tick" style={{ color: '#7fba27' }} />
                                                            )}{' '}
                                                            {item.name}
                                                        </h5>

                                                        <p className={Classes.TEXT_MUTED}>
                                                            <ReactMarkdown source={item.desc || t('NoDescription')} />
                                                        </p>
                                                    </StyledDialogSelectItem>
                                                ))}
                                            </div>
                                        </CustomDialog>
                                    )}
                                </>
                            ) : (
                                <Select
                                    items={query === '' ? filteredItems : filterItems(filteredItems)}
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
                                        name: 'field-select-filter',
                                        autoFocus: true,
                                    }}
                                    popoverProps={{
                                        popoverClassName: 'custom-popover',
                                        targetClassName: fill ? 'select-popover' : '',
                                        position: 'left',
                                    }}
                                    className={fill ? Classes.FILL : ''}
                                    onItemSelect={(item: any) => handleSelectClick(item)}
                                    query={query}
                                    onQueryChange={(newQuery: string) => setQuery(newQuery)}
                                    disabled={disabled}
                                >
                                    <Button
                                        name={`field-${name}`}
                                        fill={fill}
                                        text={value ? value : placeholder || t('PleaseSelect')}
                                        rightIcon={'caret-down'}
                                        onClick={handleClick}
                                    />
                                </Select>
                            )}
                        </>
                    )}
                    {reference && (
                        <>
                            {value && (
                                <Tooltip content={t('EditThisItem')} className={Classes.FIXED}>
                                    <Button
                                        icon="edit"
                                        name={`field-${name}-edit-reference`}
                                        onClick={() => onEditClick(value, reference, handleEditSubmit)}
                                    />
                                </Tooltip>
                            )}
                            {!editOnly && (
                                <Tooltip content={t('CreateAndAddNewItem')}>
                                    <Button
                                        icon="add"
                                        intent="success"
                                        name={`field-${name}-reference-add-new`}
                                        onClick={() => onCreateClick(reference, handleEditSubmit)}
                                    />
                                </Tooltip>
                            )}
                        </>
                    )}
                </ControlGroup>
            )}
        </FieldEnhancer>
    );
};

export default compose(withTextContext(), withMessageHandler())(SelectField);
