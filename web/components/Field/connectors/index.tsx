import React, { useState, useEffect } from 'react';
import Provider, { providers } from '../../../containers/Mapper/provider';
import { Button } from '@blueprintjs/core';

export interface IConnectorFieldProps {
    title: string;
    onChange: (id: number, name: string, data: any) => void;
    id: number;
    name: string;
    value: any;
    isEditing?: boolean;
    setEditing: any;
}

const ConnectorField: React.FC<IConnectorFieldProps> = ({
    title,
    onChange,
    id,
    name,
    value,
    isEditing,
    setEditing,
}) => {
    const [nodes, setChildren] = useState([]);
    const [provider, setProvider] = useState(null);
    const [optionProvider, setOptionProvider] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const clear = () => {
        setEditing(false);
        setOptionProvider(null);
    };

    const getUrlFromProvider: () => string = () => {
        const { type, name, path } = optionProvider;
        // Get the rules for the given provider
        const { url, suffix, recordSuffix, requiresRecord } = providers[type];
        // Build the URL based on the provider type
        return `${url}/${name}${suffix}${path}${requiresRecord ? recordSuffix : ''}`;
    };

    useEffect(() => {
        onChange(id, name, optionProvider);
    }, [optionProvider]);
    console.log(optionProvider);
    console.log(value);

    if (isEditing) {
        return (
            <span>
                {getUrlFromProvider()}
                <Button intent="danger" onClick={clear} icon="trash" />
            </span>
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
