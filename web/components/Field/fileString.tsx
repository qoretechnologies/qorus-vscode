import React, { FunctionComponent } from 'react';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import { TTranslator } from '../../App';
import TreeField from './tree';
import styled from 'styled-components';
import String from './string';

export interface IFileField {
    get_message?: { action: string; object_type: string };
    return_message?: { action: string; object_type: string; return_value: string };
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    name: string;
    t: TTranslator;
    includeInputField: boolean;
}

const Spacer = styled.div`
    margin: 5px;
`;

const FileField: FunctionComponent<IFileField & IField & IFieldChange> = ({
    onChange,
    name,
    value,
    default_value,
    includeInputField = true,
    ...rest
}) => {
    return (
        <>
            {includeInputField && (
                <>
                    <String name={name} onChange={onChange} value={value} default_value={default_value} />
                    <Spacer />
                </>
            )}
            <TreeField single onChange={onChange} name={name} value={value} {...rest} />
        </>
    );
};

export default withMessageHandler()(FileField);
