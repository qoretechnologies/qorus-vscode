import React, { useState, useEffect } from 'react';
import Provider, { providers } from '../../../containers/Mapper/provider';
import { Button, Tag } from '@blueprintjs/core';
import styled from 'styled-components';

export interface IConnectorFieldProps {
    title: string;
    onChange: (id: number, name: string, data: any) => void;
    id: number;
    name: string;
    value: any;
    isInitialEditing?: boolean;
}

const StyledProviderUrl = styled.div`
    min-height: 40px;
    line-height: 40px;

    span {
        font-weight: 500;
    }
`;

const ConnectorField: React.FC<IConnectorFieldProps> = ({ title, onChange, id, name, value, isInitialEditing }) => {
    const [nodes, setChildren] = useState([]);
    const [provider, setProvider] = useState(null);
    const [optionProvider, setOptionProvider] = useState(value);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(isInitialEditing);

    const clear = () => {
        setIsEditing(false);
        setOptionProvider(null);
    };

    const getUrlFromProvider: (val: any) => string = val => {
        const { type, name, path } = val;
        // Get the rules for the given provider
        const { url, suffix, recordSuffix, requiresRecord } = providers[type];
        // Build the URL based on the provider type
        return `${url}/${name}${suffix}${path}${requiresRecord ? recordSuffix : ''}`;
    };

    useEffect(() => {
        onChange(id, name, optionProvider);
    }, [optionProvider, isEditing]);

    if (isEditing && value) {
        return (
            <StyledProviderUrl>
                <span>{title}:</span>{' '}
                <Tag minimal large onRemove={clear}>
                    {getUrlFromProvider(value)}{' '}
                </Tag>
            </StyledProviderUrl>
        );
    }

    return (
        <Provider
            nodes={nodes}
            setChildren={setChildren}
            provider={provider}
            setProvider={setProvider}
            setOptionProvider={setOptionProvider}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            title={title}
            clear={clear}
            compact
        />
    );
};

export default ConnectorField;
