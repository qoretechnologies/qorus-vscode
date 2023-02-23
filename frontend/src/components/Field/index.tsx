import { ReqoreColumn, ReqoreColumns, ReqoreMessage } from '@qoretechnologies/reqore';
import isArray from 'lodash/isArray';
import { useContext } from 'react';
import useMount from 'react-use/lib/useMount';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { TextContext } from '../../context/text';
import { postMessage } from '../../hocomponents/withMessageHandler';
import { ApiManager } from './apiManager';
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

const Field = ({ type, interfaceId, interfaceKind, ...rest }: IFieldProps) => {
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

  if (type === 'long-string' && rest.markdown) {
    return (
      <ReqoreColumns columnsGap="10px">
        <ReqoreColumn flexFlow="column">
          <LongStringField key="description" fill {...rest} type={type} />
        </ReqoreColumn>
        {rest.value && (
          <ReqoreColumn>
            <MarkdownPreview value={rest.value} />
          </ReqoreColumn>
        )}
      </ReqoreColumns>
    );
  }

  return (
    <>
      {(!type || type === 'string') && <StringField {...rest} type={type} />}
      {type === 'long-string' && <LongStringField fill {...rest} type={type} />}
      {type === 'method-name' && <MethodNameField {...rest} type={type} />}
      {type === 'boolean' && <BooleanField {...rest} type={type} />}
      {type === 'array-of-pairs' && <MultiPairField {...rest} type={type} />}
      {type === 'select-string' && <SelectField {...rest} type={type} fill />}
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
      {type === 'api-manager' && <ApiManager {...rest} />}
      {rest.markdown && rest.value ? <MarkdownPreview value={rest.value} /> : null}
      {rest.has_to_be_valid_identifier && rest.value && !rest.isValid ? (
        <ReqoreMessage intent="danger">{t('AllowedCharsOnly')}</ReqoreMessage>
      ) : null}
    </>
  );
};

export default Field;
