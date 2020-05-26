import React, { FunctionComponent } from 'react';

import isArray from 'lodash/isArray';
import useMount from 'react-use/lib/useMount';

import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import withMessageHandler from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
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
import LongStringField from './longString';
import MapperOptionsField from './mapperOptions';
import MarkdownPreview from './markdownPreview';
import MethodNameField from './methodName';
import MultiPairField from './multiPair';
import MultiSelect from './multiSelect';
import NumberField from './number';
import RadioField from './radioField';
import SelectField from './select';
import StringField from './string';
import TypeSelector from './typeSelector';
import { validateField } from '../../helpers/validations';
import { Callout } from '@blueprintjs/core';
import ProcessorField from './processor';

export interface IFieldProps extends IField {
    t: TTranslator;
    fields: string[];
    onChange: IFieldChange;
    interfaceKind: string;
    interfaceId: string;
    requestFieldData?: (fieldName: string, fieldKey: string) => string | null;
}

const Field: FunctionComponent<IFieldProps> = withMessageHandler()(
    ({ type, postMessage, interfaceId, interfaceKind, ...rest }: IFieldProps) => {
        useMount(() => {
            if (rest.value && rest.on_change) {
                // Check if on_change is a list
                const onChange: string[] = isArray(rest.on_change) ? rest.on_change : [rest.on_change];
                // Post all the actions
                onChange.forEach(action => {
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
                    <Callout intent="danger">{rest.t('AllowedCharsOnly')}</Callout>
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
                {type === 'number' && <NumberField {...rest} type={type} />}
                {type === 'class-array' && <ClassArrayField {...rest} type={type} />}
                {type === 'type-selector' && <TypeSelector {...rest} type={type} />}
                {type === 'context-selector' && <ContextField {...rest} type={type} />}
                {type === 'processor' && <ProcessorField {...rest} type={type} />}
                {type === 'mapper-options' && (
                    <MapperOptionsField
                        {...rest}
                        type={type}
                        mapperType={rest.requestFieldData(rest.requires_fields, 'value')}
                    />
                )}
                {type === 'class-connectors' && <ClassConnectors {...rest} type={type} />}
                {rest.markdown && <MarkdownPreview value={rest.value} />}
            </>
        );
    }
);

export default withTextContext()(Field) as FunctionComponent<IField>;
