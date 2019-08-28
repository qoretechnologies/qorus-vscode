import React, { FunctionComponent, useState, FormEvent } from 'react';
import { RadioGroup, Radio, Icon, Intent } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import useMount from 'react-use/lib/useMount';
import styled from 'styled-components';
import compose from 'recompose/compose';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';

export interface IRadioField {
    t: TTranslator;
    initialData: any;
}

const StyledRadio = styled.div`
    line-height: 30px;
    height: 30px;
    cursor: pointer;

    p {
        display: inline-block;
        margin: 0;
        margin-left: 10px;
    }
`;

const LangIcon = styled.img`
    display: inline-block;
    height: 15px;
    width: 15px;
    margin-left: 10px;
    vertical-align: sub;
`;

const RadioField: FunctionComponent<IRadioField & IField & IFieldChange> = ({
    t,
    items,
    default_value,
    hasValueSet,
    onChange,
    name,
    value,
    initialData,
}) => {
    console.log(initialData);
    useMount(() => {
        // Set the default value
        onChange(name, hasValueSet ? value : default_value);
    });

    const handleValueChange: (value: string) => void = value => {
        // Send the change
        onChange(name, value);
    };

    return (
        <div>
            {items.map((v: { value: string; icon_filename: string }) => (
                <StyledRadio onClick={() => handleValueChange(v.value)}>
                    <Icon
                        icon={value === v.value ? 'selection' : 'circle'}
                        intent={value === v.value ? Intent.PRIMARY : Intent.NONE}
                    />
                    <p>{t(`field-label-${v.value}`)}</p>
                    {v.icon_filename && (
                        <LangIcon
                            src={
                                process.env.NODE_ENV === 'development'
                                    ? `http://localhost:9876/images/${v.icon_filename}`
                                    : `vscode-resource:${initialData.path}/images/${v.icon_filename}`
                            }
                        />
                    )}
                </StyledRadio>
            ))}
        </div>
    );
};

export default compose(
    withInitialDataConsumer(),
    withTextContext()
)(RadioField);
