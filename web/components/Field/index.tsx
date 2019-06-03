import React, { FunctionComponent } from 'react';
import withTextContext from '../../hocomponents/withTextContext';
import StringField from './string';
import { TTranslator } from '../../App';
import BooleanField from './boolean';
import SelectField from './select';
import MultiSelect from './multiSelect';
import RadioField from './radioField';
import MultiPairField from './multiPair';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';

export interface IField {
    type: string;
    name: string;
    t: TTranslator;
    fields: string[];
    onChange: IFieldChange;
}

const Field: FunctionComponent<IField> = ({ type, ...rest }) => {
    // Default type is string
    if (!type || type === 'string') {
        return <StringField {...rest} />;
    }
    // Boolean fields
    if (type === 'boolean') {
        return <BooleanField {...rest} />;
    }
    // Pair field
    if (type === 'array-of-pairs') {
        return <MultiPairField {...rest} />;
    }
    // Select one item
    if (type === 'select-string') {
        return <SelectField {...rest} />;
    }
    // Select multiple items
    if (type === 'select-array') {
        return <MultiSelect {...rest} />;
    }
    // Radio buttons
    if (type === 'enum') {
        return <RadioField {...rest} />;
    }

    return <span> WIP </span>;
};

export default withTextContext()(Field) as FunctionComponent<IField>;
