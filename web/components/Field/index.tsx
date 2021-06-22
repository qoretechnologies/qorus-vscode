import { Callout } from '@blueprintjs/core';
import isArray from 'lodash/isArray';
import React, { FunctionComponent, useContext } from 'react';
import useMount from 'react-use/lib/useMount';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import { TextContext } from '../../context/text';
import { postMessage } from '../../hocomponents/withMessageHandler';
import ArrayAutoField from './arrayAuto';
import AutoField from './auto';
import BooleanField from './boolean';
import ClassArrayField from './classArray';
import ClassConnectors from './classConnectors';
import ContextField from './context';
import Cron from './cron';
import DateField from './date';
import MultiFileField from './fileArray';
import FileField from './fileString';
import FSMListField from './fsmList';
import LongStringField from './longString';
import MarkdownPreview from './markdownPreview';
import MethodNameField from './methodName';
import MultiPairField from './multiPair';
import MultiSelect from './multiSelect';
import NumberField from './number';
import ProcessorField from './processor';
import RadioField from './radioField';
import SelectField from './select';
import StringField from './string';
import Options from './systemOptions';
import TypeSelector from './typeSelector';
import URLField from './urlField';

export interface IFieldProps extends IField {
    onChange: IFieldChange;
    interfaceKind?: string;
    interfaceId?: string;
    requestFieldData?: (fieldName: string, fieldKey: string) => string | null;
}

const Field: FunctionComponent<IFieldProps> = ({ type, interfaceId, interfaceKind, ...rest }: IFieldProps) => {
    const t = useContext(TextContext);

    useMount(() => {
        if (rest.value && rest.on_change) {
            // Check if on_change is a list
            const onChange: string[] = isArray(rest.on_change) ? rest.on_change : [rest.on_change];
            // Post all the actions
            onChange.forEach((action) => {
                // Post the message with this handler
                postMessage(action, {
                    [rest.name]: rest.value,
                    iface_kind: interfaceKind,
                    iface_id: interfaceId,
                });
            });
        }
    });

    return (
        <>
            {rest.has_to_be_valid_identifier && rest.value && !rest.isValid ? (
                <Callout intent="danger">{t('AllowedCharsOnly')}</Callout>
            ) : null}
            {(!type || type === 'string') && <StringField {...rest} type={type} />}
            {type === 'long-string' && <LongStringField {...rest} type={type} />}
            {type === 'method-name' && <MethodNameField {...rest} type={type} />}
            {type === 'boolean' && <BooleanField {...rest} type={type} />}
            {type === 'array-of-pairs' && <MultiPairField {...rest} type={type} />}
            {type === 'select-string' && <SelectField {...rest} type={type} />}
            {type === 'select-array' && <MultiSelect {...rest} type={type} />}
            {type === 'array' && <MultiSelect simple {...rest} type={type} />}
            {type === 'enum' && <RadioField {...rest} type={type} />}
            {type === 'file-array' && <MultiFileField {...rest} type={type} />}
            {type === 'file-string' && <FileField {...rest} type={type} />}
            {type === 'date' && <DateField {...rest} type={type} />}
            {type === 'cron' && <Cron {...rest} type={type} />}
            {type === 'auto' && <AutoField {...rest} type={type} />}
            {type === 'array-auto' && <ArrayAutoField {...rest} type={type} />}
            {['number', 'float'].includes(type) && <NumberField {...rest} type={type} />}
            {type === 'class-array' && <ClassArrayField {...rest} type={type} />}
            {type === 'type-selector' && <TypeSelector {...rest} type={type} />}
            {type === 'context-selector' && <ContextField {...rest} type={type} />}
            {type === 'processor' && <ProcessorField {...rest} type={type} />}
            {type === 'class-connectors' && <ClassConnectors {...rest} type={type} />}
            {type === 'fsm-list' && <FSMListField {...rest} type={type} />}
            {type === 'options' && <Options {...rest} />}
            {type === 'url' && <URLField {...rest} type={type} />}
            {rest.markdown && <MarkdownPreview value={rest.value} />}
        </>
    );
};

export default Field;
