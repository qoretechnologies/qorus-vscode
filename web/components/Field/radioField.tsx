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
    disabled?: boolean;
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

const icons = {
    qore: 'qore-106x128.png',
    python: 'python-129x128.png',
};

const RadioField: FunctionComponent<IRadioField & IField & IFieldChange> = ({
    t,
    items,
    default_value,
    onChange,
    name,
    value,
    initialData,
    disabled,
}) => {
    useMount(() => {
        // Set the default value
        if (!value && default_value) {
            onChange(name, default_value);
        }
    });

    const handleValueChange: (value: string) => void = (value) => {
        // Send the change
        onChange(name, value);
    };

    return (
        <div>
            {items.map((v: { value: string; icon_filename: string; icon?: string }) => (
                <StyledRadio
                    name={`field-${name}-radio-${v.value}`}
                    onClick={() => !disabled && handleValueChange(v.value)}
                >
                    <Icon
                        icon={value === v.value ? 'selection' : 'circle'}
                        intent={value === v.value ? Intent.PRIMARY : Intent.NONE}
                        color={disabled ? '#d7d7d7' : '#333'}
                    />
                    <p>{t(`field-label-${v.value}`)}</p>
                    {v.icon_filename || v.icon ? (
                        <LangIcon src={`${initialData.image_path}/images/${v.icon_filename || icons[v.icon]}`} />
                    ) : null}
                </StyledRadio>
            ))}
        </div>
    );
};

export default compose(withInitialDataConsumer(), withTextContext())(RadioField);
