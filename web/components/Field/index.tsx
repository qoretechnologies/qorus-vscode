import React, { FunctionComponent } from 'react';
import withTextContext from '../../hocomponents/withTextContext';
import StringField from './string';
import LongStringField from './longString';
import DateField from './date';
import { TTranslator } from '../../App';
import BooleanField from './boolean';
import ClassArrayField from './classArray';
import SelectField from './select';
import MultiSelect from './multiSelect';
import RadioField from './radioField';
import MultiPairField from './multiPair';
import MultiFileField from './fileArray';
import FileField from './fileString';
import { IFieldChange, IField } from '../../containers/InterfaceCreator/panel';
import Cron from './cron';
import AutoField from './auto';
import ArrayAutoField from './arrayAuto';
import useMount from 'react-use/lib/useMount';
import withMessageHandler from '../../hocomponents/withMessageHandler';
import NumberField from './number';
import MarkdownPreview from './markdownPreview';
import isArray from 'lodash/isArray';
import MapperOptionsField from './mapperOptions';
import ClassConnectors from './classConnectors';

export interface IFieldProps extends IField {
    t: TTranslator;
    fields: string[];
    onChange: IFieldChange;
    interfaceKind: string;
    interfaceId: string;
    requestFieldData: (fieldName: string, fieldKey: string) => string | null;
}

const Field: FunctionComponent<IFieldProps> = withMessageHandler()(
    ({ type, postMessage, interfaceId, interfaceKind, ...rest }: IFieldProps) => {
        useMount(() => {
            if (rest.value && rest.on_change) {
                // Check if on_change is a list
                const onChange: string[] = isArray(rest.on_change) ? rest.on_change : [rest.on_change];
                // Post all the actions
                console.log(interfaceId);
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
                {(!type || type === 'string') && <StringField {...rest} type={type} />}
                {type === 'long-string' && <LongStringField {...rest} type={type} />}
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
