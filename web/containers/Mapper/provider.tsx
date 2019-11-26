import React, { FC, useCallback, useState, useEffect } from 'react';
import { Button, ButtonGroup, Spinner } from '@blueprintjs/core';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import SelectField from '../../components/Field/select';
import map from 'lodash/map';
import size from 'lodash/size';
import styled from 'styled-components';

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
}

const StyledWrapper = styled.div`
    margin: 0 auto;
    margin-bottom: 10px;
    text-align: center;
`;

const StyledHeader = styled.h3`
    margin: 0;
    margin-bottom: 10px;
    text-align: center;
`;

const providers: any = {
    Type: {
        name: 'Type',
        url: 'dataprovider/types',
        namekey: 'typename',
        desckey: 'name',
        suffix: '',
        recordSuffix: '',
    },
    'User connections': {
        name: 'User connections',
        url: 'remote/user',
        filter: 'has_provider',
        namekey: 'name',
        desckey: 'desc',
        suffix: '/provider',
        recordSuffix: '/record',
        requiresRecord: true,
    },
    'Datasource connections': {
        name: 'Datasource connections',
        url: 'remote/datasources',
        filter: 'has_provider',
        namekey: 'name',
        desckey: 'desc',
        suffix: '/provider',
        recordSuffix: '/record',
        requiresRecord: true,
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
    title,
    type,
}) => {
    const handleProviderChange = provider => {
        setProvider(current => {
            // Fetch the url of the provider
            (async () => {
                // Clear the data
                clear(true);
                // Set loading
                setIsLoading(true);
                // Select the provider data
                const { url, filter } = providers[provider];
                // Get the data
                let { data } = await fetchData(url);
                // Remove loading
                setIsLoading(false);
                // Filter unwanted data if needed
                if (filter) {
                    data = data.filter(datum => datum[filter]);
                }
                // Add new child
                setChildren([
                    {
                        values: data.map(child => ({
                            name: child[providers[provider].namekey],
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
        clear(true);
        // Set loading
        setIsLoading(true);
        // Fetch the data
        const { data } = await fetchData(`${url}/${value}${suffix}`);
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
            }
            // Return the updated children
            else {
                // Check if there is a record
                if (data.has_record || !providers[provider].requiresRecord) {
                    (async () => {
                        setIsLoading(true);
                        if (type === 'outputs') {
                            // Save the mapper keys
                            setMapperKeys(data.mapper_keys);
                        }
                        // Fetch the record
                        const record = await fetchData(`${url}/${value}${suffix}${providers[provider].recordSuffix}`);
                        // Remove loading
                        setIsLoading(false);
                        // Set the record data
                        setRecord(!providers[provider].requiresRecord ? record.data.fields : record.data);
                    })();
                }

                return [...newItems];
            }
        });
    };

    const getDefaultItems = useCallback(() => map(providers, ({ name }) => ({ name, desc: '' })), []);

    return (
        <StyledWrapper>
            <StyledHeader>{title}</StyledHeader>
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
                            // Change the child
                            handleChildFieldChange(value, url, index, suffix);
                        }}
                        value={child.value}
                    />
                ))}
                {isLoading && <Spinner size={15} />}
                {record && <Button intent="success" icon="small-tick" onClick={() => setFields(record)} />}
            </ButtonGroup>
        </StyledWrapper>
    );
};

export default withInitialDataConsumer()(MapperProvider);
