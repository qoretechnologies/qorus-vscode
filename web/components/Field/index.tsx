import React, { FunctionComponent } from 'react';
import { InputGroup } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';
import StringField from './string';

const Field: FunctionComponent = ({ type, name, t }) => {
    if (!type || type === 'string') {
        return <StringField />;
    }

    return t(`field-label-${name}`);
};

export default withTextContext()(Field);
