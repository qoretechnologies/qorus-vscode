import React, { FunctionComponent } from 'react';
import withTextContext from '../../hocomponents/withTextContext';
import StringField from './string';
import DateField from './date';
import { TTranslator } from '../../App';
import BooleanField from './boolean';
import SelectField from './select';
import MultiSelect from './multiSelect';
import RadioField from './radioField';
import MultiPairField from './multiPair';
import MultiFileField from './fileArray';
import FileField from './fileString';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import Cron from './cron';
import AutoField from './auto';
import ArrayAutoField from './arrayAuto';
import useMount from 'react-use/lib/useMount';
import withMessageHandler from '../../hocomponents/withMessageHandler';

export interface IField {
    type: string;
    name: string;
    t: TTranslator;
    fields: string[];
    value?: any;
    default_value?: any;
    onChange: IFieldChange;
    requestFieldData: (fieldName: string, fieldKey: string) => string | null;
}

const Field: FunctionComponent<IField> = withMessageHandler()(({ type, postMessage, ...rest }) => {
    useMount(() => {
        if (rest.value && rest.on_change) {
            // Post the message with this handler
            postMessage(rest.on_change, {
                [rest.name]: rest.value,
                iface_kind: type,
            });
        }
    });

    // Default type is string
    if (!type || type === 'string') {
        return <StringField {...rest} type={type} />;
    }
    // Boolean fields
    if (type === 'boolean') {
        return <BooleanField {...rest} type={type} />;
    }
    // Pair field
    if (type === 'array-of-pairs') {
        return <MultiPairField {...rest} type={type} />;
    }
    // Select one item
    if (type === 'select-string') {
        return <SelectField {...rest} type={type} />;
    }
    // Select multiple items
    if (type === 'select-array') {
        return <MultiSelect {...rest} type={type} />;
    }
    // Simple array
    if (type === 'array') {
        return <MultiSelect simple {...rest} type={type} />;
    }
    // Radio buttons
    if (type === 'enum') {
        return <RadioField {...rest} type={type} />;
    }
    // Files
    if (type === 'file-array') {
        return <MultiFileField {...rest} type={type} />;
    }

    if (type === 'file-string') {
        return <FileField {...rest} type={type} />;
    }
    // Date
    if (type === 'date') {
        return <DateField {...rest} type={type} />;
    }
    // Cron
    if (type === 'cron') {
        return <Cron {...rest} type={type} />;
    }
    // Auto field
    if (type === 'auto') {
        return <AutoField {...rest} type={type} />;
    }
    if (type === 'array-auto') {
        return <ArrayAutoField {...rest} type={type} />;
    }

    return <span> WIP </span>;
});

export default withTextContext()(Field) as FunctionComponent<IField>;
