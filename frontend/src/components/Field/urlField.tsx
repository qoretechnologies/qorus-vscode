import { ControlGroup } from '@blueprintjs/core';
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { InitialContext } from '../../context/init';
import SelectField from './select';
import StringField from './string';

export interface IURLFieldProps {
    url?: string;
    value: string;
    name: string;
    onChange: (name: string, value: string) => any;
}

const StyledUrlSeparator = styled.div`
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid #d7d7d7;
    border-bottom: 1px solid #d7d7d7;
    background-color: #eee;
`;

export const getProtocol = (v) => {
    return v?.split('://')?.[0] || '';
};

export const getAddress = (v) => {
    return v?.split('://')?.[1] || '';
};

const URLField: React.FC<IURLFieldProps> = ({ url, value, name, onChange }) => {
    const { fetchData, qorus_instance } = useContext(InitialContext);
    const [protocols, setProtocols] = useState<string[]>(['http', 'https', 'rest', 'rests']);
    const [protocol, setProtocol] = useState<string>(getProtocol(value));
    const [address, setAddress] = useState<string>(getAddress(value));

    useEffect(() => {
        if (url && qorus_instance) {
            (async () => {
                setProtocols(['http', 'https']);
                // Fetch the options for this mapper type
                const data = await fetchData(url);

                if (data.error) {
                    return;
                }
                // Save the new options
                setProtocols(data.data);
            })();
        }
    }, [url, qorus_instance]);

    useEffect(() => {
        onChange(name, `${protocol}://${address}`);
    }, [protocol, address]);

    useEffect(() => {
        setProtocol(getProtocol(value));
        setAddress(getAddress(value));
    }, [value]);

    return (
        <ControlGroup fill>
            <SelectField
                fill
                defaultItems={protocols.map((prot) => ({ name: prot }))}
                onChange={(_name, value) => setProtocol(value)}
                name="protocol"
                value={protocol}
            />
            <StyledUrlSeparator>://</StyledUrlSeparator>
            <StringField value={address} onChange={(_name, value) => setAddress(value)} name="address" fill />
        </ControlGroup>
    );
};

export default URLField;
