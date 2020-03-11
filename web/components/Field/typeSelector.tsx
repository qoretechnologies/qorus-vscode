import React, { FunctionComponent, useState, useEffect } from 'react';
import StringField from './string';
import SelectField from './select';
import { Button, ButtonGroup, ControlGroup, Callout } from '@blueprintjs/core';
import styled from 'styled-components';
import { size } from 'lodash';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import compose from 'recompose/compose';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import ConnectorField from './connectors';

const TypeSelectorField: FunctionComponent<TTranslator & IField & IFieldChange> = ({
    name,
    onChange,
    value,
    t,
    initialData,
}) => {
    const handleChange: (name: string, val: any) => void = (name, val) => {
        onChange(name, val);
    };

    return initialData.qorus_instance ? (
        <ConnectorField
            value={value}
            isInitialEditing={!!initialData.workflow}
            title={t('StaticDataProvider')}
            name={name}
            onChange={handleChange}
        />
    ) : (
        <Callout intent="warning">{t('ActiveInstanceProvidersConnectors')}</Callout>
    );
};

export default compose(withInitialDataConsumer(), withTextContext())(TypeSelectorField);
