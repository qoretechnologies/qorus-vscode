import React, { useState, useContext } from 'react';
import useMount from 'react-use/lib/useMount';
import { TextContext } from '../../context/text';
import map from 'lodash/map';
import AutoField from './auto';
import { getValueOrDefaultValue } from '../../helpers/validations';
import { ControlGroup } from '@blueprintjs/core';
import Number from './number';
import SelectField from './select';
import { splitByteSize } from '../../helpers/functions';

const ByteSizeField = ({ value, default_value, onChange, name, canBeNull, disabled, read_only }) => {
    // Fetch data on mount
    useMount(() => {
        // Populate default value
        onChange && onChange(name, getValueOrDefaultValue(value, default_value, canBeNull));
    });

    const [bytes, size] = splitByteSize(value);

    return (
        <ControlGroup>
            <Number name="bytes" value={bytes} onChange={(_name, val) => onChange(name, `${val || ''}${size || ''}`)} />
            <SelectField
                name="size"
                value={size}
                defaultItems={[{ name: 'KB' }, { name: 'MB' }]}
                onChange={(_name, val) => onChange(name, `${bytes || ''}${val}`)}
            />
        </ControlGroup>
    );
};

export default ByteSizeField;
