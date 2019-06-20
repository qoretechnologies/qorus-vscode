import React, { FunctionComponent, useState, useEffect } from 'react';
import { ITreeNode, Tree } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { includes, size } from 'lodash';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import { TTranslator } from '../../App';
import MultiSelect from './multiSelect';
import TreeField from './tree';
import styled from 'styled-components';

export interface IMultiFileField {
    get_message: { action: string; object_type: string };
    return_message: { action: string; object_type: string; return_value: string };
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    name: string;
    t: TTranslator;
}

const Spacer = styled.div`
    margin: 5px;
`;

const MultiFileField: FunctionComponent<IMultiFileField & IField & IFieldChange> = ({
    onChange,
    name,
    value = [],
    ...rest
}) => {
    return (
        <>
            <MultiSelect simple name={name} onChange={onChange} value={value} />
            <Spacer />
            <TreeField onChange={onChange} name={name} value={value} {...rest} />
        </>
    );
};

export default withMessageHandler()(MultiFileField);
