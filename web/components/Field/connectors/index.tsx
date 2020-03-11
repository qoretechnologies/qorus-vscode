import React, { useState, useEffect } from 'react';
import Provider, { providers } from '../../../containers/Mapper/provider';
import { Tag } from '@blueprintjs/core';
import styled from 'styled-components';

export interface IConnectorFieldProps {
    title?: string;
    onChange: (name: string, data: any) => void;
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

const ConnectorField: React.FC<IConnectorFieldProps> = ({ title, onChange, name, value, isInitialEditing }) => {
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
        onChange(name, optionProvider);
    }, [optionProvider, isEditing]);

    if (isEditing && value) {
        return (
            <StyledProviderUrl>
                {title && <span>{title}:</span>}{' '}
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
