import React, { FC, useCallback, useContext, useState } from 'react';

import map from 'lodash/map';
import size from 'lodash/size';
import styled, { css } from 'styled-components';

import { Button, ButtonGroup, Callout, Classes, Spinner } from '@blueprintjs/core';

import CustomDialog from '../../components/CustomDialog';
import SelectField from '../../components/Field/select';
import String from '../../components/Field/string';
import { TextContext } from '../../context/text';
import { validateField } from '../../helpers/validations';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';

export interface IProviderProps {
    type: 'inputs' | 'outputs';
    provider: string;
    setProvider: any;
    nodes: any[];
    setChildren: any;
    isLoading: boolean;
    setIsLoading: any;
    record: any;
    setRecord: any;
    setFields: any;
    initialData: any;
    clear: any;
    title: string;
    setOptionProvider: any;
    hide: any;
}

const StyledWrapper = styled.div<{ compact?: boolean; hasTitle: boolean }>`
    margin-bottom: 10px;
    ${({ compact, hasTitle }) =>
        compact
            ? css`
                  margin-top: ${hasTitle ? '10px' : 0};
              `
            : css`
                  margin: 0 auto;
                  text-align: center;
              `}
    > span {
        vertical-align: middle;
        font-weight: 500;
        line-height: 20px;
    }
`;

const StyledHeader = styled.h3`
    margin: 0;
    margin-bottom: 10px;
    text-align: center;
`;

export const providers = {
    type: {
        name: 'type',
        url: 'dataprovider/types',
        suffix: '',
        recordSuffix: '/type',
        type: 'type',
    },
    connection: {
        name: 'connection',
        url: 'remote/user',
        filter: 'has_provider',
        namekey: 'name',
        desckey: 'desc',
        suffix: '/provider',
        recordSuffix: '/record',
        requiresRecord: true,
        type: 'connection',
    },
    remote: {
        name: 'remote',
        url: 'remote/qorus',
        filter: 'has_provider',
        namekey: 'name',
        desckey: 'desc',
        suffix: '/provider',
        recordSuffix: '/record',
        requiresRecord: true,
        type: 'remote',
    },
    datasource: {
        name: 'datasource',
        url: 'remote/datasources',
        filter: 'has_provider',
        namekey: 'name',
        desckey: 'desc',
        suffix: '/provider',
        recordSuffix: '/record',
        requiresRecord: true,
        type: 'datasource',
    },
    factory: {
        name: 'null',
        url: '',
        filter: null,
        suffix: null,
        recordSuffix: null,
        requiresRecord: false,
        type: 'factory',
    },
};

const MapperProvider: FC<IProviderProps> = ({
    provider,
    setProvider,
    nodes,
    setChildren,
    isLoading,
    setIsLoading,
    record,
    setRecord,
    setFields,
    clear,
    initialData: { fetchData },
    setMapperKeys,
    setOptionProvider,
    title,
    type,
    hide,
    compact,
    canSelectNull,
}) => {
    const [wildcardDiagram, setWildcardDiagram] = useState(null);
    const t = useContext(TextContext);

    const handleProviderChange = provider => {
        setProvider(current => {
            // Fetch the url of the provider
            (async () => {
                // Clear the data
                clear && clear(true);
                // If user set null
                if (provider === 'null') {
                    setOptionProvider({
                        type: 'factory',
                        name: 'null',
                        path: '/',
                    });
                    // Set the record data
                    setRecord && setRecord({});
                    setChildren([]);
                    setFields({});
                    hide();
                    // Stop
                    return;
                }
                // Set loading
                setIsLoading(true);
                // Select the provider data
                const { url, filter } = providers[provider];
                // Get the data
                let { data, error } = await fetchData(url);
                // Remove loading
                setIsLoading(false);
                // Filter unwanted data if needed
                if (filter) {
                    data = data.filter(datum => datum[filter]);
                }
                // Save the children
                let children = data.children || data;
                // Add new child
                setChildren([
                    {
                        values: children.map(child => ({
                            name: providers[provider].namekey ? child[providers[provider].namekey] : child,
                            desc: '',
                            url,
                            suffix: providers[provider].suffix,
                        })),
                        value: null,
                    },
                ]);
            })();
            // Set the provider
            return provider;
        });
    };

    const handleChildFieldChange: (value: string, url: string, itemIndex: number, suffix?: string) => void = async (
        value,
        url,
        itemIndex,
        suffix
    ) => {
        // Clear the data
        clear && clear(true);
        // Set loading
        setIsLoading(true);
        // Fetch the data
        const { data, error } = await fetchData(`${url}/${value}${suffix}`);
        if (error) {
            console.log(`${url}/${value}${suffix}`, error);
            setIsLoading(false);
            return;
        }
        // Reset loading
        setIsLoading(false);
        // Add new child
        setChildren(current => {
            // Update this item
            const newItems: any[] = current
                .map((item, index) => {
                    const newItem = { ...item };
                    // Update the value if the index matches
                    if (index === itemIndex) {
                        newItem.value = value;
                    }
                    // Also check if there are items with
                    // higher index (children) and remove them
                    if (index > itemIndex) {
                        return null;
                    }
                    // Return the item
                    return newItem;
                })
                .filter(item => item);
            // If this provider has children
            if (size(data.children)) {
                // Return the updated items and add
                // the new item
                return [
                    ...newItems,
                    {
                        values: data.children.map(child => ({
                            name: child,
                            desc: '',
                            url: `${url}/${value}${suffix}`,
                            suffix: '',
                        })),
                        value: null,
                    },
                ];
            } else if (data.supports_request) {
                // Return the updated items and add
                // the new item
                return [
                    ...newItems,
                    {
                        values: [
                            {
                                name: 'request',
                                desc: '',
                                url: `${url}/${value}${suffix}`,
                                suffix: '',
                            },
                            {
                                name: 'response',
                                desc: '',
                                url: `${url}/${value}${suffix}`,
                                suffix: '',
                            },
                        ],
                        value: null,
                    },
                ];
            }
            // Return the updated children
            else {
                if (data.fields) {
                    // Save the name by pulling the 3rd item from the split
                    // url (same for every provider type)
                    const name = `${url}/${value}`.split('/')[2];
                    // Set the provider option
                    setOptionProvider({
                        type: providers[provider].type,
                        can_manage_fields: data.can_manage_fields,
                        name,
                        subtype: value === 'request' || value === 'response' ? value : undefined,
                        path: `${url}/${value}`
                            .replace(`${name}`, '')
                            .replace(`${providers[provider].url}/`, '')
                            .replace('provider/', '')
                            .replace('request', '')
                            .replace('response', ''),
                    });
                    // Set the record data
                    setRecord && setRecord(data.fields);
                }
                // Check if there is a record
                else if (data.has_record || data.has_type || !providers[provider].requiresRecord) {
                    (async () => {
                        setIsLoading(true);
                        if (type === 'outputs' && data.mapper_keys) {
                            // Save the mapper keys
                            setMapperKeys && setMapperKeys(data.mapper_keys);
                        }
                        // Fetch the record
                        const record = await fetchData(
                            `${url}/${value}${suffix}${providers[provider].recordSuffix}${
                                type === 'outputs' ? '?soft=true' : ''
                            }`
                        );
                        // Remove loading
                        setIsLoading(false);
                        // Save the name by pulling the 3rd item from the split
                        // url (same for every provider type)
                        const name = `${url}/${value}`.split('/')[2];
                        // Set the provider option
                        setOptionProvider({
                            type: providers[provider].type,
                            name,
                            can_manage_fields: record.data.can_manage_fields,
                            path: `${url}/${value}`
                                .replace(`${name}`, '')
                                .replace(`${providers[provider].url}/`, '')
                                .replace('provider/', ''),
                        });
                        // Set the record data
                        setRecord && setRecord(!providers[provider].requiresRecord ? record.data.fields : record.data);
                        //
                    })();
                }

                return [...newItems];
            }
        });
    };

    const getDefaultItems = useCallback(
        () =>
            map(providers, ({ name }) => ({ name, desc: '' })).filter(prov =>
                prov.name === 'null' ? canSelectNull : true
            ),
        []
    );

    return (
        <>
            {wildcardDiagram?.isOpen && (
                <CustomDialog title={t('Wildcard')} isOpen isCloseButtonShown={false}>
                    <div className={Classes.DIALOG_BODY}>
                        <Callout intent="primary">{t('WildcardReplace')}</Callout>
                        <br />
                        <String
                            name="wildcard"
                            onChange={(_name, value) => setWildcardDiagram(cur => ({ ...cur, value }))}
                            value={wildcardDiagram.value}
                        />
                    </div>
                    <div className={Classes.DIALOG_FOOTER}>
                        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                            <Button
                                intent="success"
                                disabled={!validateField('string', wildcardDiagram.value)}
                                onClick={() => {
                                    handleChildFieldChange(
                                        wildcardDiagram.value,
                                        wildcardDiagram.url,
                                        wildcardDiagram.index,
                                        wildcardDiagram.suffix
                                    );
                                    setWildcardDiagram(null);
                                }}
                                text={t('Submit')}
                            />
                        </div>
                    </div>
                </CustomDialog>
            )}
            <StyledWrapper compact={compact} hasTitle={!!title}>
                {!compact && <StyledHeader>{title}</StyledHeader>}
                {compact && title && <span>{title}: </span>}{' '}
                <ButtonGroup>
                    <SelectField
                        name="input"
                        disabled={isLoading}
                        defaultItems={getDefaultItems()}
                        onChange={(_name, value) => {
                            handleProviderChange(value);
                        }}
                        value={provider}
                    />
                    {nodes.map((child, index) => (
                        <SelectField
                            key={title + index}
                            name="smth"
                            disabled={isLoading}
                            defaultItems={child.values}
                            onChange={(_name, value) => {
                                // Get the child data
                                const { url, suffix } = child.values.find(val => val.name === value);
                                // If the value is a wildcard present a dialog that the user has to fill
                                if (value === '*') {
                                    setWildcardDiagram({
                                        index,
                                        isOpen: true,
                                        url,
                                        suffix,
                                    });
                                } else {
                                    // Change the child
                                    handleChildFieldChange(value, url, index, suffix);
                                }
                            }}
                            value={child.value}
                        />
                    ))}
                    {isLoading && <Spinner size={15} />}
                    {record && (
                        <Button
                            intent="success"
                            icon="small-tick"
                            onClick={() => {
                                setFields(record);
                                hide();
                            }}
                        />
                    )}
                </ButtonGroup>
            </StyledWrapper>
        </>
    );
};

export default withInitialDataConsumer()(MapperProvider);
