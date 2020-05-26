import React, { useState, useEffect } from 'react';
import Provider, { providers } from '../../../containers/Mapper/provider';
import { Tag, Callout, Button } from '@blueprintjs/core';
import styled from 'styled-components';
import withInitialDataConsumer from '../../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../../hocomponents/withTextContext';
import compose from 'recompose/compose';
import { TTranslator } from '../../../App';
import size from 'lodash/size';

export interface IConnectorFieldProps {
    title?: string;
    onChange: (name: string, data: any) => void;
    name: string;
    value: any;
    isInitialEditing?: boolean;
    initialData: any;
    inline?: boolean;
    t: TTranslator;
}

const StyledProviderUrl = styled.div`
    min-height: 40px;
    line-height: 40px;

    span {
        font-weight: 500;
    }
`;

const ConnectorField: React.FC<IConnectorFieldProps> = ({
    title,
    onChange,
    name,
    value,
    isInitialEditing,
    initialData,
    inline,
    t,
}) => {
    const [nodes, setChildren] = useState([]);
    const [provider, setProvider] = useState(null);
    const [optionProvider, setOptionProvider] = useState(value);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(isInitialEditing);

    const clear = () => {
        setIsEditing(false);
        setOptionProvider(null);
    };

    const reset = () => {
        setChildren([]);
        setProvider(null);
        setOptionProvider(null);
        setIsLoading(false);
    };

    const getUrlFromProvider: (val: any) => string = (val) => {
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

    if (!initialData.qorus_instance) {
        return <Callout intent="warning">{t('ActiveInstanceProvidersConnectors')}</Callout>;
    }

    return (
        <>
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
                style={{
                    display: inline ? 'inline-block' : 'block',
                }}
            />
            {size(nodes) ? <Button intent="danger" icon="cross" onClick={reset} /> : null}
        </>
    );
};

export default compose(withTextContext(), withInitialDataConsumer())(ConnectorField);
